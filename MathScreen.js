//@flow
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import React from "react";

// 3rd party libraries
import socket_io from "socket.io-client";
const seedrandom = require("seedrandom");

// Local
import Dimmer from "./Dimmer.js";
import Config from "./Config.js";
import GrabnerProblems from "./GrabnerProblems.js";
import {eegObservable} from "./Streaming";

import {bufferCount} from "rxjs/operators";

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

    if (Config.ngrok.length) this.serverUri = `wss://${Config.ngrok}.ngrok.io`
    else                     this.serverUri = `ws://${Config.serverIp}:${Config.serverPort}`;
    this.serverUri += "/subjects";

    console.log(`Trying to connect to ${this.serverUri}`);
    this.socket = socket_io(this.serverUri);
    this.dimmer = new Dimmer(brightness => {
      this.socket.emit("event",{
        timestamp: Date.now(), type: "brightness",brightness
      });
    });

    this.socket.on("connect", () => {
      console.log(`Connection opened at ${this.serverUri}`);
    });
    this.socket.on("disconnect", () => {
      console.log(`Disconnected from brain-butler-server`);
    });
    this.socket.on("start",() => this.startExperiment());
    this.socket.on("end", () => this.endExperiment() );

 }

  render() {
    const {textState} = this.state;

    return (
      <View style={{flex: 1}}>

        <View style={{flex: 2}}>
          <Text style={styles.warningText}>{this.state.warningText}</Text>
        </View>
        <View style={ {flex: 1} }>
          <Text style={styles.mainText}>
            {
              textState === TextState.Strategy ? this.strategyPrompt :
              textState === TextState.Problem  ? this.nextProblem    :
              textState === TextState.Fixation ? "\u2716"            :
              textState === TextState.Blank    ? ""                  :
              textState === TextState.Wait     ? this.waitingText    :
                                                 ""
            }
          </Text>
        </View>
        <View style={{flex: 2}}></View>

      </View>
    );
  }
  componentWillUnmount() {
    this.endExperiment();
    this.socket.close();
  }

  async startExperiment() {
    this.giveWarning = Config.initialCondition == "C1";
    this.sendCondition();
    this.sendStaticForms();
    this.problemSet = new GrabnerProblems();
    this.problemsSeen = -1;

    const rng = require("seedrandom")(0);
    const shuffledBools = (n) =>
      shuffle(Array(n).fill(true,0,n/2).fill(false,n/2), rng);

    const n = this.problemSet.length();
    this.dimScreen = [...shuffledBools(n/2),...shuffledBools(n/2)];

    this.subscription = eegObservable
                        .pipe(bufferCount(256))
                        .subscribe(epoch => {
                          this.socket.emit("event",{
                            type:"eeg", eeg:epoch, timestamp: Date.now()
                          });
                        });

    this.experimenting = true;
    this.nextTrial();

  }
  endExperiment() {
    if (this.subscription) this.subscription.unsubscribe();

    this.experimenting = false;
    this.timeouts.forEach((id) => clearTimeout(id));
    this.clearWarning();
    this.dimmer.brightenScreen();

    this.setState(prev => {
       return {warningText: "", textState: TextState.Wait}
    });
  }


  nextTrial() {
    const dimScreen = this.dimScreen;

    if (++this.problemsSeen === this.problemSet.length() / 2)
      this.switchConditions();
    else if (this.problemsSeen === this.problemSet.length())
      this.socket.emit("end")

    this.nextProblem = this.problemSet.next();

    this.displayFixationPoint();
    this.setTimeout(() => { this.displayProblem(); }, Config.delays.problem);
    if (this.giveWarning)
      this.setTimeout(() => {this.displayWarning();}, Config.delays.warning);

    this.setTimeout(() => {
      this.clearWarning();
      if (dimScreen[this.problemsSeen]) this.dimmer.darkenScreen();
    }, Config.delays.darkness);


    this.setTimeout(() => {
      this.displayPrompt();
      if (dimScreen[this.problemsSeen]) this.dimmer.brightenScreen();
    }, Config.delays.prompt);
    this.setTimeout(() => {this.nextTrial();}, Config.delays.nextTrial);
  }

  displayPrompt() {
    this.setState(prev => {
      this.socket.emit("event", {
        type: "strategyPrompt", timestamp: Date.now(),
        strategyPrompt: this.strategyPrompt
      });
      return {textState: TextState.Strategy}
    });
    this.sendPromptForm();
  }
  displayFixationPoint() {
    this.setState(prev => {
      this.socket.emit("event", {
        type: "fixationPoint", timestamp: Date.now()
      });
      return {textState: TextState.Fixation}
    });
  }
  displayBlankScreen() {
    this.setState(prev => {
      if (this.state.textState === TextState.Problem) {
        this.socket.emit("event", {
          type: "blankScreen", timestamp: Date.now()
        });
        return {textState: TextState.Blank}
      }
      return prev;
    });
  }
  displayProblem() {
    this.setState(prev => {
      this.socket.emit("event", {
        type: "problem", problem: this.nextProblem
      });
      return {textState: TextState.Problem};
    });
    this.sendMathForm();
  }

  displayWarning() {
    this.setState((prev) => {
      const warningText = "About to darken";
      this.socket.emit("event", {
        type:"warning", warning: warningText, timestamp: Date.now()
      });
      return {text:prev.text, warningText};
    });
  }
  clearWarning() {
    if (this.state.warningText.length === 0) return;
    this.setState((prev) => {
      this.socket.emit("event",{
        type: "removeWarning", timestamp: Date.now()
      });
      return {text: prev.text, warningText: ""}
    });
  }
  switchConditions() {
    this.giveWarning = !this.giveWarning;
    this.sendCondition();
  }


  setTimeout(callback, delay: Number) {
      this.timeouts.push(setTimeout(callback, delay));
      if (this.timeouts.length > 30) this.timeouts = this.timeouts.slice(10);
  }

  sendStaticForms() {
    this.socket.emit("form", {
      constant: true,
      title: "Body Language",
      categories: ["Choice"],
      fields: [
        {name: "movement", labels: ["Movement"], values: ["movement"], exclusive: true}
      ]
    });
  }

  sendCondition() {
    this.socket.emit("event", {
      type: "condition",
      conditon: this.giveWarning ? "C1" : "C2",
      timestamp: Date.now()
    });
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


function showWarnings(n) {
  let show = Array(n/2).fill(false);
  show.push( Array(n/2).full(true) )

}

import {permutation} from "fy-random";
function shuffle(arr, rng) {
  return permutation(arr.length, rng).map(ind => arr[ind]);
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
