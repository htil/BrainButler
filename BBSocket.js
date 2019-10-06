import {DeviceEventEmitter} from "react-native";
import {fromEvent} from "rxjs";

const props = require("./props.json");
socket_io = require("socket.io-client");

export default class BBSocket {

  //PUBLIC, STATIC
  static getInstance() {
      if (!BBSocket.instance) BBSocket.instance = new BBSocket();
      return BBSocket.instance;
  }

  //PUBLIC, INSTANCE
  open(onopen) {
    if (this.socket) this.close();

    this.serverUri = `${props.ip}:${props.port}/subjects`
    this.socket = socket_io(this.serverUri);

    this.socket.on("connect", () => {
      if (onopen) onopen();
      console.log(`Connection to brain-butler-server opened at ${this.serverUri}`);
    });
    this.socket.on("disconnect", () => {
      console.log(`Disconnected from brain-butler-server`);
    });

    this.socket.on("start", () => {
      DeviceEventEmitter.emit("start");
    });
    
    this.socket.on("next", () => {
      DeviceEventEmitter.emit("next");
    });
    this.socket.on("end", () => {
      DeviceEventEmitter.emit("end");
    });

  }

  close() {
    this.socket.close();
    this.socket = null;
  }

  sendMathForm() {
    const form = {
      title: "Math Problem",
      categories: ["Text"],
      fields: [
        {name: "solution", label: "Solution"}
      ],
    };
    this.socket.emit("form", form);
  }
  sendPromptForm() {
    const form = {
      title: "Strategy",
      categories: ["Choice"],
      fields: [
        {
          name: "strategy",
          labels: ["Fact Retrieval", "Procedure Use", "Other"],
          values: ["factRetrieval", "procedureUse", "other"],
          exclusive: true
        }
      ]
    }
    this.socket.emit("form", form);
  }

  //PRIVATE, STATIC
  static instance = null;

  //PRIVATE, INSTANCE
  constructor() {
    this.socket = null;
    this.serverUri = null;
  }

}
