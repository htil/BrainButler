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
    this.ws.onopen = onopen;

    this.ws.onmessage = (message) => {
        const parsed = JSON.parse(message.data);
        DeviceEventEmitter.emit("BBAction", parsed.action);
    }
    console.log(`Connection to brain-butler-server opened at ${this.serverUri}`);
  }
  send(packet) {
      this.ws.send(packet);
  }
  close() {
      console.log(`Closing connection to brain-butler-server at ${this.serverUri}`);
      this.ws.close();
      this.ws = null;
  }

  //PRIVATE, STATIC
  static instance: BBSocket = null;

  //PRIVATE, INSTANCE
  constructor() {
    this.ws = null;
    this.serverUri = null;
    this.actionObservable = fromEvent(DeviceEventEmitter, "BBAction");
  }

  ws: Websocket;
  serverUri: string;

}
