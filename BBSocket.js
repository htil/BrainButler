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
  open(onopen?: () => void) {
    if (this.ws) this.close();

    this.serverUri = Config.serverUri;
    this.ws = new WebSocket(this.serverUri);
    this.ws.onopen = onopen;
    console.log(`Connection to brain-butler-server opened at ${this.serverUri}`);

    this.ws.onmessage = (message) => {
        DeviceEventEmitter.emit("BBAction", JSON.parse(message.data));
    }
  }
  send(packet) {
      this.ws.send(packet);
  }
  close() {
      console.log(`Closing connection to brain-butler-server at ${this.serverUri}`);
      this.ws.close();
      this.ws = null;
  }

  reward(id, r) {
      this.ws.send(JSON.stringify({type: "reward", body: {id, r}}));
  }

  actions() {return this.actionObservable;}

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
