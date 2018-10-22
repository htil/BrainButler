"use strict";
import {DeviceEventEmitter} from "react-native";

export default class MuseManager
{
  static getInstance()
  {
    if (!MuseManager.instance) MuseManager.instance = new MuseManager();
    return MuseManager.instance;
  }

  static instance = null;

  constructor()
  {
    if (MuseManager.instance) throw "There can only be one MuseManager";
    this.museName = null;
    this.connectionStatus = null;
    this.subscriptions = [];

    this.statusCallback = ([museName, connectionStatus]) => {
      this.museName = museName;
      this.connectionStatus = connectionStatus;
      this.subscriptions.forEach(callback => callback(museName, connectionStatus));
    }
    DeviceEventEmitter.addListener("ChangeMuseConnectionState", this.statusCallback);
  }

  subscribeConnectionState(callback)
  {
    this.subscriptions.push(callback);
  }
  unsubscribeConnectionState(callback)
  {
     const index = this.subscriptions.indexOf(callback);
     if (index < 0) return;
     this.subscriptions.splice(index, 1);
  }
}
