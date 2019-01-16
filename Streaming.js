//@flow
import {MuseDeviceManager} from "react-native-muse";
import {bandpassFilter} from "@neurosity/pipes";
import {map} from "rxjs/operators";
import type {Observable} from "rxjs";

import Orientation from "react-native-orientation";
import {setUpdateIntervalForType, SensorTypes,
  accelerometer, gyroscope} from "react-native-sensors";

import Config from "./Config.js";

const manager = MuseDeviceManager.getInstance();
export const eegObservable: Observable = manager.data().pipe(
  bandpassFilter({
    nbChannels: manager.getChannelNames().length,
    cutoffFrequencies: [Config.highpass, Config.lowpass]
  }),
);

setUpdateIntervalForType(SensorTypes.accelerometer, 4 *  1000./Config.sampleFrequency);
setUpdateIntervalForType(SensorTypes.gyroscope, 4 * 1000./Config.sampleFrequency);

export const accObservable = accelerometer;
export const gyroObservable = gyroscope;
