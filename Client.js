//@flow
import props from "./props.json";
// Props Schema: {ips: Array<String>, port: Array<Number}


type Message = {
  role: "eeg" | "acc" | "gyro" | "orient",
}

export default class Client
{
  static instance: Client = null;
  static getInstance(): Client
  {
    if (Client.instance == null) Client.instance = new Client();
    return Client.instance;
  }

  constructor()
  {
    if (Client.instance != null) throw "You tried to instantiate an extra Client instance";

    this.socket = new WebSocket(`ws://${props.ip[0]}:${props.port[0]}`);
    this.socket.onclose = () => {
      console.log("Disconnected from server");
    }
    this.socket.onopen = () => {console.log("Connected to server");}
  }

  sendEEG(packet)
  {
    const m: Message = {role: "eeg", data: packet};
    this.socket.send(JSON.stringify(m));
  }

}
