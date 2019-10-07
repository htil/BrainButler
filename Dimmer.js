//@flow
import SystemSetting from "react-native-system-setting";

import Config from "./Config";

export default class Dimmer {
  constructor(callback) {
    this.callback = callback;
  }

  brightenScreen(record) {
    this._changeBrightness(Config.brightness.full, record)
  }

  darkenScreen(record) {
    this._changeBrightness(Config.brightness.low, record)
  }

  _changeBrightness(num, record) {
			SystemSetting.getAppBrightness().then((curr) => {
        if (Math.abs(num - curr) <= 0.001) return;

        SystemSetting.setAppBrightness(num);
        this.callback(num);
			});
  }

} //End Dimmer class
