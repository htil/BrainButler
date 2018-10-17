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
    this.muse = null;
    DeviceEventEmitter.addListener("OnMuseConnect", muse => {this.muse = muse;});
    DeviceEventEmitter.addListener("OnMuseDisconnect", muse => {this.muse = null;});
  }
}
