//@flow
import {Alert} from "react-native";

import Orientation from "react-native-orientation";
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

		this.orientListener = (orientation: String): void => {
        orientation = orientation.toLowerCase();
				this.socket.send(JSON.stringify({type: "event",
          body: {eventName: "orientation", orientation, timestamp: Date.now()
        }}));
		};
		Orientation.addOrientationListener(this.orientListener);

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
    }, 5000));

    this.callbackIds.push(setInterval(() => {
      this._rotate()
    }, 15000));
  } //End constructor

  destructor() {
		Orientation.removeOrientationListener(this.orientListener);

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
      headerData.labels.push("orientation");
      headerData.sampleFrequency.push(0);
      headerData.prefilter.push("None");
      headerData.physicalDimension.push("None");
      headerData.labels.push("brightness");
      headerData.sampleFrequency.push(0);
      headerData.prefilter.push("None");
      headerData.physicalDimension.push("None");
			socket.send(JSON.stringify({type: "header", body: headerData}));

      Orientation.getOrientation((err, orientation) => {
        orientation = orientation.toLowerCase();
				socket.send(JSON.stringify({
					type: "event",
					body: {eventName: "orientation", orientation, timestamp: Date.now()}
				}));
			});

			SystemSetting.getAppBrightness().then((curr) => {
        const brightness = "full"; //FIXME: Derive this from `curr`
				socket.send(JSON.stringify({
					type: "event",
					body: {eventName: "brightness", brightness, timestamp: Date.now()}
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

  _changeBrightness(value, name) {
			SystemSetting.getAppBrightness().then((curr) => {
        if (Math.abs(value - curr) > 0.001) {
					this.socket.send(JSON.stringify({type: "event",
						body: {eventName: "brightness", timestamp: Date.now(), brightness: name}
					}));
  			  SystemSetting.setAppBrightness(value);
        }
			});
  }

  //We don't send an event through the BBSocket, because the OrientationListener
  // already does so
  _rotate(id) {
	  Orientation.getOrientation((err, orientation) => {
		  if (orientation == "LANDSCAPE") Orientation.lockToPortrait();
		  else                            Orientation.lockToLandscape();
    });
  }


  _brighten(id) {
	   SystemSetting.getAppBrightness().then((curr) => {
		     SystemSetting.setAppBrightness(Config.brightness.full);
	   });
  }

  _notify(title, message, id) {
     Alert.alert(title, message,
       [
         {text: "Thanks",    onPress: () => {this.socket.reward(id, 2);} },
         {text: "No Thanks", onPress: () => {this.socket.reward(id, -1);} }
       ],
       {cancelable: false}
     );
   }
} //End class


const title: String = "Hey!";
const brightenMessage: String =
  "It seemed like you were still looking, so I brightened the screen!";
const rotateMessage: String =
  "It seemed like you wanted the screen this way!";
