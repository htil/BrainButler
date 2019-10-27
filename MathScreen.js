//@flow
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import React from "react";

// 3rd party libraries
import socket_io from "socket.io-client";
import KeepAwake from "react-native-keep-awake";
import Sound from "react-native-sound";
const seedrandom = require("seedrandom");

// Local
import Dimmer from "./Dimmer.js";
import Config from "./Config.js";
import GrabnerProblems from "./GrabnerProblems.js";
import PracticeProblems from "./PracticeProblems";
import {eegObservable} from "./Streaming";

import {bufferCount} from "rxjs/operators";

const TextState = {Strategy : 0,Problem : 1,Fixation : 2,Blank : 3,Wait : 4, Pause: 5};
type Props = {navigation: object};
type State = {textState: object};
export default class MathScreen extends React.Component<Props, State> {
  state: State;
  beepSound: Sound;
  practice: Boolean;
  toPause: Boolean;

  constructor(props) {
    super(props);
    this.strategyPrompt =  "1 ...Retrieval? \n" +
                           "2 ...Procedural? \n" +
                           "3 ...Other?";

    this.state  = {textState: TextState.Wait};
    this.timeouts = [];
    this.practice = this.props.navigation.getParam("practice", false);
    this.problemSet = this.practice ? new PracticeProblems() : new GrabnerProblems();
    this.toPause = false;

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
    this.socket.on("start", async () => {await this.experiment()});
    this.socket.on("continue", async () => {await this.continueExperiment();});
    this.socket.on("pause", () => {this.toPause = true;});
    this.socket.on("end", () => this.stop() );

    this.beepSound = new Sound(Config.soundPath, Sound.MAIN_BUNDLE, error => {
      if (error) console.log(error);
    });
 }

  render() {
    const {textState} = this.state;
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 2}}></View>
        <View style={ {flex: 1} }>
          <Text style={styles.mainText}>
            {
              textState === TextState.Strategy ? this.strategyPrompt            :
              textState === TextState.Problem  ? this.problem                   :
              textState === TextState.Fixation ? "\u2716"                       :
              textState === TextState.Blank    ? ""                             :
              textState === TextState.Wait     ? "Waiting for Researcher..."    :
              textState === TextState.Pause    ? "Paused"                       :
                                                 ""
            }
          </Text>
        </View>
        <View style={{flex: 2}}></View>
      </View>
    );
  }

  componentDidMount() {
    KeepAwake.activate();
  }
  componentWillUnmount() {
    this.stop();
    this.socket.close();
    KeepAwake.deactivate();
  }

  prepDarkenings() {
    this.giveWarning = Config.initialCondition == "C1";
    this.sendCondition();
    const rng = require("seedrandom")(0);
    const shuffledBools = (n) =>
      shuffle(Array(n).fill(true,0,n/2).fill(false,n/2), rng);
    const n = this.problemSet.length();
    this.dimScreen = [...shuffledBools(n/2),...shuffledBools(n/2)];
  }

  async experiment() {
    this.problemSet.reset();
    this.sendStaticForms();
    if (!this.practice) this.prepDarkenings();

    this.problemsSeen = 0;
    await this.continueExperiment();
  }

  async continueExperiment() {
    this.toPause = false;
    this.subscription = eegObservable
                        .pipe(bufferCount(8))
                        .subscribe(epoch => {
                          this.socket.emit("event",{
                            type:"eeg", eeg:epoch, timestamp: Date.now()
                          });
                        });

    while (this.problemsSeen < this.problemSet.length() && !this.toPause) {
      await this.trial();
      ++this.problemsSeen;
    }
    if (this.problemsSeen >= this.problemSet.length()) this.stop(false);
    else                                               this.stop(true);
  }

  stop(temporary = false) {
    this.dimmer.brightenScreen();
    const textState = temporary ? TextState.Pause : TextState.Wait;
    this.toPause = false;
    this.setState(prev => { return {textState} });
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.socket.emit("event", {
      type: "paused", timestamp: Date.now()
    });
  }

  async darkening() {
    if (this.problemsSeen === this.problemSet.length() / 2) this.switchConditions();
    const dimScreen = this.dimScreen;
    const delays = Config.delays.short;

    let timePassed = 0;
    await sleep(delays.warning);
    if (this.giveWarning) this.provideWarning();
    timePassed += delays.warning;

    await sleep(delays.darkness - timePassed);
    if (dimScreen[this.problemsSeen]) this.dimmer.darkenScreen();
    timePassed += delays.darkness - timePassed;

    await sleep(delays.prompt - timePassed);
    this.dimmer.brightenScreen();
  }

  async trial() {
    if (!this.practice) this.darkening();
    const delays = Config.delays.short;
    this.problem = this.problemSet.next();

    let timePassed = 0;

    this.displayFixationPoint();
    await sleep(delays.problem);
    timePassed += delays.problem;
    this.displayProblem();

    await sleep(delays.prompt - timePassed);
    timePassed += (delays.prompt - timePassed);
    this.displayPrompt();

    await sleep(delays.nextTrial - timePassed);
    timePassed += (delays.nextTrial - timePassed);
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
        type: "problem", problem: this.problem
      });
      return {textState: TextState.Problem};
    });
    this.sendMathForm();
  }

  provideWarning() {
    const timestamp = Date.now();
    this.beepSound.play(success => {
      if (!success) return;
      this.socket.emit("event", {type: "tone", timestamp});
    });
  }
  switchConditions() {
    this.giveWarning = !this.giveWarning;
    this.sendCondition();
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
      title: this.problem,
      categories: ["Choice"],
      fields: [
        {
          name: this.problem,
          labels: ["Correct", "Incorrect"],
          values: ["correct", "incorrect"],
          exclusive: true
        }
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
