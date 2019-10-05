//@flow
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import React from "react";

//3rd party libraries
import SystemSetting from "react-native-system-setting";

import Controller from "./Controller.js";
import Config from "./Config.js";

import problems from "./problems.json";
import ProblemSet from "./ProblemSet.js";

import {warn, removeWarning} from "./warnings.js";

const TextState = {
  Strategy : 0,
  Problem : 1,
  Fixation : 2,
  Blank : 3,
  Wait : 4
}

type Props = {};
type State = {
  warningText: string,
  textState: object,
};
export default class MathScreen extends React.Component<Props, State> {
  state: State;
  blankenTimeout: number;

  constructor(props) {
    super(props);
    this.waitingText = "Waiting for researcher...";
    this.strategyPrompt =  "1 ...Retrieval? \n" +
                           "2 ...Procedural? \n" +
                           "3 ...Other?";

    this.state  = {warningText: "", textState: TextState.Wait};
    this.intervals = [];
    this.timeouts = [];
    this.blankenTimeout = -1;

    this.controller = new Controller();
    this.problemSet = new ProblemSet(problems);

    this.startCallback = () => this.startExperiment();
    this.nextCallback = () => {

      if (this.state.textState === TextState.Strategy) {
        if (this.problemSet.hasNext()) this.nextTrial();
        else                           this.endExperiment();
      }
      else {
        this.displayStrategyPrompt();
      }
    }
    DeviceEventEmitter.addListener("next", this.nextCallback);
    DeviceEventEmitter.addListener("start", this.startCallback);

  }
  render() {
    const flexPadding = styles.main.flex;
    const {textState} = this.state;

    return (
      <View style={{flex: 1}}>
        <View style={{flex: flexPadding}}>
          <Text style={styles.warningText}>{this.state.warningText}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.mainText}>
            {
              textState === TextState.Strategy ? this.strategyPrompt :
              textState === TextState.Problem  ? this.nextProblem    :
              textState === TextState.Fixation ? "."                 :
              textState === TextState.Blank    ? ""                  :
              textState === TextState.Wait     ? this.waitingText    :
                                                 ""
            }
          </Text>
        </View>
        <View style={{flex: flexPadding}}></View>
      </View>
    );
  }
  componentWillUnmount() { this.restoreApplication(); }


  startExperiment() {
    this.setDarknessTimeout();
    this.nextTrial();
  }
  restoreApplication() {
    DeviceEventEmitter.removeListener("nextTrial", this.nextCallback);
    DeviceEventEmitter.removeListener("start", this.startCallback);
    this.intervals.forEach((id) => clearInterval(id));
    this.timeouts.forEach((id) => clearTimeout(id));
    this.controller.destructor();
    SystemSetting.setAppBrightness(Config.brightness.full);
  }

  endExperiment() {
    this.setState(prev => {
       return {warningText: "", textState: TextState.Wait}
    });
    this.props.navigation.goBack(null);
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

  nextTrial() {
    this.nextProblem = this.problemSet.next();
    this.displayFixationPoint();
    this.setTimeout(() => { this.displayProblem(); }, 3000);
  }

  displayStrategyPrompt() {
    this.setState(prev => {return {textState: TextState.Strategy} });
    this.controller.sendPromptForm();
  }
  displayFixationPoint() {
    this.setState(prev => { return {textState: TextState.Fixation} });
  }
  displayBlankScreen() {
    this.setState(prev => {
      if (this.state.textState === TextState.Problem) return {textState: TextState.Blank}
      return prev;
    });
  }
  displayProblem() {
      this.setState(prev => { return {textState: TextState.Problem}; });
      this.blankenTimeout = this.setTimeout(() => {this.displayBlankScreen();}, 7000);
      this.controller.sendMathForm();
  }


  setTimeout(callback, delay: Number) {
      this.timeouts.push(setTimeout(callback, delay));
      if (this.timeouts.length > 30) this.timeouts = this.timeouts.slice(10);
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
