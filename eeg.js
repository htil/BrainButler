"use strict";
import {DeviceEventEmitter} from "react-native";
import {fromEvent} from "rxjs";
import {map} from "rxjs/operators";
import {bandpassFilter, epoch} from "@neurosity/pipes";

const MUSE_RATE = 256; //Muse sends packets at about 256Hz
const EEG_CHANNELS = ["EEG1", "EEG2", "EEG3", "EEG4"]; //TODO: Obtain these constants from RNLibMuseModule

function format2pipes(eeg_packet)
{
  return {
    data: EEG_CHANNELS.map(channel => eeg_packet[channel]),
    timestamp: new Date(eeg_packet.timestamp), //eeg_packet.timestamp is in millliseconds since epoch
    info: {
      samplingRate: MUSE_RATE,
      channelNames: EEG_CHANNELS
    }
  }
}

function eeg_observable(epoch_size, epoch_interval)
{
  return fromEvent(DeviceEventEmitter, "MUSE_EEG").pipe(
    map(format2pipes),
    bandpassFilter({nbChannels: EEG_CHANNELS.length, cutoffFrequencies: [1, 30]}),
    epoch({duration: epoch_size, interval: epoch_interval, samplingRate: MUSE_RATE})
  );
}

export {eeg_observable};
