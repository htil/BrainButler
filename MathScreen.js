//@flow
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import React from "react";

// 3rd party libraries
import socket_io from "socket.io-client";

// Local
import Dimmer from "./Dimmer.js";
import Config from "./Config.js";
import net_props from "./props.json";
import GrabnerProblems from "./GrabnerProblems.js";

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
    this.timeouts = [];
    this.blankenTimeout = -1;
    this.experimenting = false;

    this.serverUri = `${net_props.ip}:${net_props.port}/subjects`;
    this.socket = socket_io(this.serverUri);
    this.dimmer = new Dimmer( (val) => {} );

    this.socket.on("connect", () => {
      console.log(`Connection to brain-butler-server opened at ${this.serverUri}`);
    });
    this.socket.on("disconnect", () => {
      console.log(`Disconnected from brain-butler-server`);
    });
    this.socket.on("start",() => this.startExperiment());
    this.socket.on("end", () => this.endExperiment() );
    this.socket.on("next", () => {
      if (this.state.textState === TextState.Strategy) {
        if (this.problemSet.hasNext()) this.nextTrial();
        else                           this.socket.emit("end");
      }
      else                             this.displayStrategyPrompt();
    });

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
  componentWillUnmount() {
    this.endExperiment();
    this.socket.close();
  }

  async startExperiment() {
    this.problemSet = new GrabnerProblems();

    this.experimenting = true;
    this.nextTrial();
    await this.cycleBrightness();

  }
  endExperiment() {
    this.experimenting = false;
    this.timeouts.forEach((id) => clearTimeout(id));
    removeWarning(this);
    this.dimmer.brightenScreen();

    this.setState(prev => {
       return {warningText: "", textState: TextState.Wait}
    });
  }

  async cycleBrightness(warning) {
    if (warning === undefined || warning == null)
      warning = true;

    while (this.experimenting) {
      const timeout = darknessTimeout();
      await sleep(timeout - Config.darkness.warning);
      if (!this.experimenting) break;

      // Display warning for a brief bit
      if (warning) warn (this);
      await sleep(Config.darkness.warning);
      if (!this.experimenting) break;

      // Darken screen and remove warning at same time
      removeWarning(this);
      this.dimmer.darkenScreen();
      await sleep(Config.darkness.length);
      if (!this.experimenting) break;

      this.dimmer.brightenScreen();
    }
  }


  nextTrial() {
    this.nextProblem = this.problemSet.next();
    this.displayFixationPoint();
    this.setTimeout(() => { this.displayProblem(); }, 3000);
  }

  displayStrategyPrompt() {
    this.setState(prev => {return {textState: TextState.Strategy} });
    this.sendPromptForm();
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
      this.sendMathForm();
  }


  setTimeout(callback, delay: Number) {
      this.timeouts.push(setTimeout(callback, delay));
      if (this.timeouts.length > 30) this.timeouts = this.timeouts.slice(10);
  }

  sendMathForm() {
    const form = {
      title: "Math Problem",
      categories: ["Text"],
      fields: [
        {name: "solution", label: "Solution"}
      ],
    };
    this.socket.emit("form", form);
  }
  sendPromptForm() {
    const form = {
      title: "Strategy",
      categories: ["Choice"],
      fields: [
        {
          name: "strategy",
          labels: ["Fact Retrieval", "Procedure Use", "Other"],
          values: ["factRetrieval", "procedureUse", "other"],
          exclusive: true
        }
      ]
    }
    this.socket.emit("form", form);
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
