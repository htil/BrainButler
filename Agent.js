//@flow
import SystemSetting from "react-native-system-setting";

import Config, {edfHeader} from "./Config";
import BBSocket from "./BBSocket";
import {eegObservable} from "./Streaming";

export default class Agent {
  constructor() {
		this.eegBuffer = [];
		this.subscriptions = [];
		this.callbackIds = [];

		this.socket = Agent._openSocket();

		this.subscriptions.push( eegObservable.subscribe((packet) => {
			this.eegBuffer.push(packet);
			if (Config.sampleFrequency <= this.eegBuffer.length)
			{
				this.socket.send(JSON.stringify({type: "data", body: this.eegBuffer}));
				this.eegBuffer = [];
			}
		}));

		this.callbackIds.push(setInterval(() => {
      this._darkenScreen();
    }, Config.brightnessTimeout));

  } //End constructor

  destructor() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];
		this.callbackIds.forEach(callbackId => clearInterval(callbackId));
		this.callbackIds = [];
    this.socket.send(JSON.stringify({type: "eof"}));
		this.socket.close();
  }

  static _openSocket() {
    const socket = BBSocket.getInstance();
		socket.open(() => {

      var headerData = edfHeader();
      headerData.labels.push("brightness");
      headerData.sampleFrequency.push(0);
      headerData.prefilter.push("None");
      headerData.physicalDimension.push("None");
			socket.send(JSON.stringify({type: "header", ...headerData}));


			SystemSetting.getAppBrightness().then((curr) => {
        const brightness = "full"; //FIXME: Derive this from `curr`
				socket.send(JSON.stringify({
					type: "event", name: "brightness",
          value: brightness, timestamp: Date.now()
				}));
			});
		});

    return socket;
  }

  brightenScreen() {
    this._changeBrightness(Config.brightness.full, "full")
  }

  _darkenScreen() {
      this._changeBrightness(Config.brightness.low, "low")
  }

  _changeBrightness(num, str) {
			SystemSetting.getAppBrightness().then((curr) => {
        if (Math.abs(num - curr) > 0.001) {
					this.socket.send(JSON.stringify({
            type: "event", name: "brightness",
            timestamp: Date.now(), value: num
					}));
  			  SystemSetting.setAppBrightness(num);
        }
			});
  }

} //End Agent class
