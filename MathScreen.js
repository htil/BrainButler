//@flow
import {View, Text, StyleSheet} from "react-native";
import React from "react";

//3rd party libraries
import SystemSetting from "react-native-system-setting";

import Controller from "./Controller.js";
import problems from "./problems.json";
import Config from "./Config.js";

type Props = {};
type State = {warningText: String, text: String};
export default class MathScreen extends React.Component<Props, State> {

  setTimeout(callback, delay: Number) {
      this.timeouts.push(setTimeout(callback, delay));

      if (this.timeouts.length > 30) this.timeouts = this.timeouts.slice(10);
  }

  rebrighten() {
    this.setTimeout(() => {
      this.controller.brightenScreen();
      this.setDarknessTimeout();
    }, Config.darkness.length);
  }

  setDarknessTimeout(warning: Boolean = true) {
    const timeout = darknessTimeout();
    this.setTimeout(() => {
      if (warning) this.warn();
      this.setTimeout(() => {
        this.removeWarning();
        this.controller.darkenScreen();
        this.rebrighten();
      }, Config.darkness.warning);
    }, timeout - Config.darkness.warning);
  }


  constructor(props) {
    super(props);
    this.state  = {text: problems[0].text, warningText: ""};
    this.controller = new Controller();

    this.probIndex = 0;
    this.intervals = [];
    this.timeouts = [];

    this.intervals.push(setInterval(() => {
      this.probIndex = (this.probIndex + 1) % problems.length;
      this.setState((prev) => {
        return {text: problems[this.probIndex].text}
      });
    }, Config.problems.interval));

    this.setDarknessTimeout();

  }

  render() {
    const flexPadding = styles.equation.flex;
    return (
      <View style={{flex: 1}}>
        <View style={{flex: flexPadding}}>
          <Text style={styles.warningText}>{this.state.warningText}</Text>
        </View>
        <View style={styles.equation}>
          <Text style={styles.equationText}>{this.state.text}</Text>
        </View>
        <View style={{flex: flexPadding}}></View>
      </View>
    );
  }

  warn() {
    this.setState((prev) => {
      const text = prev.text;
      return {text, warningText: "About to darken"};
    });
  }
  removeWarning() {
    this.setState((prev) => {
        return {text: prev.text, warningText: ""}
    });
  }

  componentWillUnmount() {
    this.intervals.forEach((id) => clearInterval(id));
    this.timeouts.forEach((id) => clearInterval(id));
    this.controller.destructor();

    SystemSetting.setAppBrightness(Config.brightness.full);
  }
}

function darknessTimeout() {
  const val = Config.darkness.minTimeout +
    Math.random() * (Config.darkness.maxTimeout - Config.darkness.minTimeout);
  return val;
}

const styles = StyleSheet.create({
  warningText:
  {
      fontSize: 40,
      color: "blue",
      fontWeight: "bold",
      textAlign: "center",
  },
  equation:
  {
    flex: 1,
  },
  equationText:
  {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center"
  }
});
