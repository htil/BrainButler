//@flow
import {Alert} from "react-native";

import Orientation from "react-native-orientation";
import SystemSetting from "react-native-system-setting";

import Config from "./Config";
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

 		this.subscriptions.push(this.socket.actions().subscribe( ({id, action}) => {
      console.log(`Taking action ${action}`);
			if      (action == "brighten") this._brighten(id);
			else if (action == "rotate")   this._rotate(id);
		}));

		this.callbackIds.push( setInterval(() => {this._darkenScreen()}, 10000) );
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
			socket.send(JSON.stringify({type: "header", body: {}}));

			Orientation.getOrientation((err, orientation) => {
        orientation = orientation.toLowerCase();
				socket.send(JSON.stringify({
					type: "event",
					body: {eventName: "orientation", orientation, timestamp: Date.now()}
				}));
			});

			SystemSetting.getAppBrightness().then((curr) => {
        const brightness = brightnessSetting(curr);
				socket.send(JSON.stringify({
					type: "event",
					body: {eventName: "brightness", brightness, timestamp: Date.now()}
				}));
			});
		});
    return socket;
  }

	_darkenScreen() {
			SystemSetting.getAppBrightness().then((curr) =>{

				const newSetting = brightnessSetting(curr);
				const newValue = Config.brightness[newSetting];

				if ( (newValue < curr) && (Math.abs(newValue - curr) > 0.001) )
					this.socket.send(JSON.stringify({type: "event",
						body: {eventName: "brightness", timestamp: Date.now(), brightness: newSetting}
					}));

  			SystemSetting.setAppBrightness(newValue);
			});
	}

  _rotate(id) {
	  Orientation.getOrientation((err, orientation) => {
		  if (orientation == "LANDSCAPE") Orientation.lockToPortrait();
		  else                            Orientation.lockToLandscape();
		  Orientation.unlockAllOrientations();
      this._notify(title, rotateMessage, id);
    });
  }


  _brighten(id) {
	   SystemSetting.getAppBrightness().then((curr) => {
		     SystemSetting.setAppBrightness(Config.brightness.full);
         this._notify(title, brightenMessage, id);
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

function brightnessSetting(value) {
				if      (value == Config.brightness.full)   return "medium";
				else if (value == Config.brightness.medium) return "low";
				return "low";
}

const title: String = "Hey!";
const brightenMessage: String =
  "It seemed like you were still looking, so I brightened the screen!";
const rotateMessage: String =
  "It seemed like you wanted the screen this way!";
