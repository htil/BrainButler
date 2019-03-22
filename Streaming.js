//@flow
import {MuseDeviceManager} from "react-native-muse";
import type {Observable} from "rxjs";

import Config from "./Config.js";

const manager = MuseDeviceManager.getInstance();
export const eegObservable: Observable = manager.data(); /*.pipe(

  bandpassFilter({
    nbChannels: manager.getChannelNames().length,
    cutoffFrequencies: [Config.highpass, Config.lowpass]
  }),
);
*/
