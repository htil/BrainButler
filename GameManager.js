"use strict";
import {DeviceEventEmitter} from "react-native";
import {eeg_observable} from "./eeg";

function lastTimestamp(eegEpoch)
{

}

export default class GameManager
{
  static EPOCH_SIZE = 256; //Number of samples in an epoch
  static EPOCH_INTERVAL = 100; //ms between emitted epochs
  constructor()
  {
    this.goods = [];
    this.bads = [];
    this.latestPacket = null;

    this.recordGood = () => {
      this.goods.push(this.latestPacket);
      //console.log("goods = "+this.goods);
    }
    this.recordBad = () => {
      this.bads.push(this.latestPacket);
      //console.log("bads = "+this.bads);
    }

    DeviceEventEmitter.addListener("ArtificialGood", this.recordGood);
    DeviceEventEmitter.addListener("ArtificialBad", this.recordBad);

    this.eegStream = eeg_observable(GameManager.EPOCH_SIZE, GameManager.EPOCH_INTERVAL).subscribe(
      eegPacket => {
        this.latestPacket = eegPacket;
	      //console.log(this.latestPacket);
      });
  }

  destructor()
  {
    DeviceEventEmitter.removeListener("ArtificialGood", this.recordGood);
    DeviceEventEmitter.removeListener("ArtificialBad", this.recordBad);
    this.eegStream.unsubscribe();
  }
}
