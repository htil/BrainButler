//@flow
import props from "./props.json"; // Props Schema: {ips: Array<String>, port: Array<Number}
import type {EegEpoch, Message} from "brain-butler-schema";

export default class Client
{
  //PUBLIC, CLASS
  static getInstance(): Client
  {
    if (Client.instance == null) Client.instance = new Client();
    return Client.instance;
  }

  //PUBLIC, INSTANCE
  connect()
  {
    if (this.connected) return;

    this.socket = new WebSocket(`ws://${props.ip[0]}:${props.port[0]}`);
    this.socket.onopen = () => {
      this.connected = true;
      console.log("Connected to server");
    }
    this.socket.onclose = () => {
      this.connected = false;
      console.log("Disconnected from server");
      this.socket = null;
    }
  }

  sendEEG(epoch: EegEpoch)
  {
    if (!this.connected)
    {
      console.log("Tried to send EEG through a closed socket.");
      return;
    }
    const m: Message = {role: "eeg", data: epoch};
    this.socket.send(JSON.stringify(m));
  }

  //PRIVATE, CLASS
  static instance: Client = null;

  //PRIVATE, INSTANCE
  socket: WebSocket;
  connected: boolean;

  constructor()
  {
    if (Client.instance != null) throw "You tried to instantiate an extra Client instance";
    this.connected = false;
    this.connect();
  }

}
