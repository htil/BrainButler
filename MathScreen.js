//@flow
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import React from "react";

//3rd party libraries
import SystemSetting from "react-native-system-setting";

import Controller from "./Controller.js";
import problems from "./problems.json";
import Config from "./Config.js";

import {warn, removeWarning} from "./warnings.js";

type Props = {};
type State = {warningText: string, text: string, playing: boolean};
export default class MathScreen extends React.Component<Props, State> {
  blankenTimeout: number;
  state: State;

  constructor(props) {
    super(props);
    this.state  = {text: "Waiting for researcher...", warningText: "", playing: false};
    this.probIndex = -1;
    this.intervals = [];
    this.timeouts = [];
    this.blankenTimeout = -1;

    this.controller = new Controller();

    this.actionCallback = (action, ...args) => {
        this[action].apply(this, args);
    };
    DeviceEventEmitter.addListener("BBAction", this.actionCallback);

  }

  startExperiment() {
    this.setDarknessTimeout();
    this.displayFixationPoint();
  }

  render() {

    const flexPadding = styles.main.flex;
    return (
      <View style={{flex: 1}}>
        <View style={{flex: flexPadding}}>
          <Text style={styles.warningText}>{this.state.warningText}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.mainText}>{this.state.text}</Text>
        </View>
        <View style={{flex: flexPadding}}></View>
      </View>
    );
  }
  componentWillUnmount() {
    DeviceEventEmitter.removeListener("BBAction", this.actionCallback);
    this.intervals.forEach((id) => clearInterval(id));
    this.timeouts.forEach((id) => clearTimeout(id));
    this.controller.destructor();
    SystemSetting.setAppBrightness(Config.brightness.full);
  }

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
      if (warning) warn(this);
      this.setTimeout(() => {
        removeWarning(this);
        this.controller.darkenScreen();
        this.rebrighten();
      }, Config.darkness.warning);
    }, timeout - Config.darkness.warning);
  }

  changeCenterText(text: string, eventName: string) {
      if (this.blankenTimeout != -1) {
        clearTimeout(this.blankenTimeout);
        this.blankenTimeout = -1;
      }
      //console.log("Changed the centerText: blankenTimeout = "+this.blankenTimeout);

      this.setState((prev) => { return {text}; });
      this.controller.recordEvent({
        type: "event", name: eventName,
        value: text, timestamp: Date.now()
      });
  }
  blankenText() { this.changeCenterText("", "blankScreen"); }

  displayProblem() {
      this.probIndex = (this.probIndex + 1) % problems.length;
      const text = problems[this.probIndex].text;
      this.changeCenterText(text, "problem");
      this.blankenTimeout = setTimeout(() => {this.blankenText();}, 7000);
      //console.log("blankenTimeout = "+this.blankenTimeout);
  }

  displayStrategyPrompt() {
      const text =  "1 ...Retrieval? \n" +
                    "2 ...Procedural? \n" +
                    "3 ...Other?";
      this.changeCenterText(text, "strategyPrompt");
  }
  displayIntertrial() {
    this.blankenText();
    this.setTimeout(() => {this.displayFixationPoint();}, 2000);
  }

  displayFixationPoint() {
    this.changeCenterText(".", "fixationPoint");
    this.setTimeout(() => {this.displayProblem();}, 3000);
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
      fontSize: 20,
      color: "blue",
      fontWeight: "bold",
      textAlign: "center",
  },
  main:
  {
    flex: 1,
  },
  mainText:
  {
    fontSize: 45,
    fontWeight: "bold",
    textAlign: "center"
  }
});
