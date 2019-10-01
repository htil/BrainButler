//@flow
import {DeviceEventEmitter} from "react-native";
import {fromEvent} from "rxjs";

import Config from "./Config.js";

export default class BBSocket {

  //PUBLIC, STATIC
  static getInstance(): BBSocket {
      if (!BBSocket.instance) BBSocket.instance = new BBSocket();
      return BBSocket.instance;
  }

  //PUBLIC, INSTANCE
  open(onopen?: () => void, onmessage?: () => void) {
    if (this.ws) this.close();

    this.serverUri = Config.serverUri;
    this.ws = new WebSocket(this.serverUri);
    this.ws.onopen = () => {
      if (onopen) onopen();
      console.log(`Connection to brain-butler-server opened at ${this.serverUri}`);
    }

    this.ws.onmessage = (message) => {
        const parsed = JSON.parse(message.data);
        console.log(`Got a message`);

        if (parsed.type === "next") {
          console.log("Emitting 'nextTrial'")
          DeviceEventEmitter.emit("nextTrial");
        }
        else if (parsed.type === "start") {
          DeviceEventEmitter.emit("start");
        }
    }
    this.ws.onclose = (e) => {
      console.log(`Closing connection to brain-butler-server at ${this.serverUri}`);
    };
  }
  send(packet) {
      //Guards from lingering callbacks after close() has been called
      if (this.ws) this.ws.send(packet);
  }
  close() {
      this.ws.close();
      this.ws = null;
  }

  //PRIVATE, STATIC
  static instance: BBSocket = null;

  //PRIVATE, INSTANCE
  constructor() {
    this.ws = null;
    this.serverUri = null;
  }

  ws: Websocket;
  serverUri: string;

}
