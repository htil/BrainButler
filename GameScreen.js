"use strict";
import React from "react";
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import {TouchableNativeFeedback} from "react-native";
import GameManager from "./GameManager";

export default class GameScreen extends React.Component
{
  //state: equation
  static PROB_WRONG = 0.5; //0.3; //Probability of showing an incorrect equation
  static MAX_OPERAND = 9;
  static MIN_ERROR = 50;
  static MAX_ERROR = 100;

  static MAX_TRIALS = 5; //30;
  static INTERVAL = 500 //2000; //Interval between equations in ms

  constructor(props)
  {
    super(props);
    this.manager = new GameManager();
    this.state =
    {
      playing: false,
      equation: "Error, we shouldn't be showing you an equation yet.",
      trialCount: -1
    };

    this.playing = false;
    this.finished = false;
    this.trialCount = -1;

    this.rightEpochs = [];
    this.wrongEpochs = [];

    this.callbackIds = [];

    this.startGame = () =>
    {
      console.log("startGame()");
      this.playing = true;
      this.finished = false;
      this.trialCount = 1;

      this.setState(prev => {equation: this.genEquation()});
      var callbackID = setInterval(() => {
        this.setState(prev => {
          if (this.trialCount >= GameScreen.MAX_TRIALS)
          {
            this.playing = false;
            this.finished = true;
            return {equation:"Error"};
          }

          ++this.trialCount;
          return {equation: this.genEquation()};
        });
      }, GameScreen.INTERVAL);
      this.callbackIds.push(callbackID);
    } //End this.startGame
  }//End constructor

  render()
  {
    //console.log("Re-rendering()");
    if (this.finished) return this.finishedScreen();
    if (!this.playing) return this.instructionsScreen();

    const flexPadding = styles.equation.flex;
    return (
      <View style={{flex: 1}}>
        <View style={{flex: flexPadding}}></View>
        <View style={styles.equation}>
          <Text style={styles.equationText}>{this.state.equation}</Text>
        </View>
        <View style={{flex: flexPadding}}></View>
      </View>
    );
  }


  instructionsScreen()
  {
    return (
      <View style={{flex:1}}>
        <View style={{flex:1}}></View>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              For each equation, say whether it is right or wrong.
            </Text>
          </View>
        <View style={{flex:1}}></View>
        <ChoiceButton text="OK" onPress={this.startGame}/>
      </View>
    );
  }

  finishedScreen()
  {
    return (
      <View style={{flex:1}}>
        <View style={{flex:1}}></View>
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>You have finished the game!</Text>
        </View>
        <View style={{flex:1}}></View>
      </View>
    );
  }

  genEquation()
  {
    const a = Math.ceil(Math.random() * GameScreen.MAX_OPERAND);
    const b = Math.ceil(Math.random() * GameScreen.MAX_OPERAND);
    var sum = a + b;
    if (Math.random() <= GameScreen.PROB_WRONG)
    {
      const error = GameScreen.MIN_ERROR +
        Math.floor(Math.random() * (GameScreen.MAX_ERROR+1-GameScreen.MIN_ERROR));
      const sign = (Math.random() <= 0.5) ? 1 : -1;
      sum += error;
    }
    return a + " + " + b + " = " + sum;
  }

  componentWillUnmount()
  {
    this.callbackIds.forEach(callbackId => clearInterval(callbackId));
    this.manager.destructor();

    console.log("RIGHT");
    console.log(JSON.stringify(this.rightEpochs));
    console.log("WRONG");
    console.log(JSON.stringify(this.wrongEpochs));
  }
}

class ChoiceButton extends React.Component
{
  //Props: onPress, backgroundColor, text
  render()
  {
    return (
      <TouchableNativeFeedback onPress={this.props.onPress}>
        <View style={styles.choiceButton}>
          <View style={{flex:1}}></View>
          <Text style={styles.choiceText}>{this.props.text}</Text>
          <View style={{flex:1}}></View>
        </View>
      </TouchableNativeFeedback>
    );
  }
}

const styles = StyleSheet.create({
  instructions:
  {
    flex: 1,
  },
  instructionsText:
  {
    fontSize: 40,
    textAlign: "center"
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
  },
  choiceButton:
  {
    flex: 1,
    backgroundColor: "blue",
  },
  choiceText:
  {
    textAlign: "center",
    color: "white",
    fontSize: 60
  },
});
