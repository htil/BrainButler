//@flow
import AppConfig from "./props.json";

export default class BBSocket {

  //PUBLIC, STATIC
  static getInstance(): BBSocket {
      if (!BBSocket.instance) BBSocket.instance = new BBSocket();
      return BBSocket.instance;
  }

  //PUBLIC, INSTANCE
  open(onopen: () => void) {
    if (this.ws) this.close();

    this.serverUri = `ws://${AppConfig.ip}:${AppConfig.port}`;
    this.ws = new WebSocket(this.serverUri);
    this.ws.onopen = onopen;
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
  }

  ws: Websocket;
  serverUri: string;

}
