"use strict";
import React from "react";
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import {TouchableNativeFeedback} from "react-native";
import GameManager from "./GameManager";

export default class GameScreen extends React.Component
{
  //state: equation
  static PROB_WRONG = 0.3; //Probability of showing an incorrect equation
  static MAX_OPERAND = 50;
  static MAX_ERROR = 10;

  constructor(props)
  {
    super(props);
    this.manager = new GameManager();
    this.state = {equation: this.genEquation()};

    this.confirmCorrect = () => {
      DeviceEventEmitter.emit("ArtificialGood");
      this.setState(previousState => {return {equation: this.genEquation()} });
      console.log("Changed the state");
    }
    this.confirmWrong = () => {
      DeviceEventEmitter.emit("ArtificialBad");
      this.setState(previousState => {return {equation: this.genEquation()} });
      console.log("Changed the state");
    }
  }

  genEquation()
  {
    const a = Math.ceil(Math.random() * GameScreen.MAX_OPERAND);
    const b = Math.ceil(Math.random() * GameScreen.MAX_OPERAND);
    var sum = a + b;
    if (Math.random() <= GameScreen.PROB_WRONG)
    {
      const error = Math.ceil(Math.random() * GameScreen.MAX_ERROR);
      const sign = (Math.random() <= 0.5) ? 1 : -1;
      sum += error;
    }
    return a + " + " + b + " = " + sum;
  }

  render()
  {
    return (
      <View style={{flex: 1}}>
        <View style={styles.equation}>
          <Text>{this.state.equation}</Text>
        </View>
        <View style={{flex: 1, flexDirection: "row"}}>
          <ChoiceButton text="Right!" backgroundColor="green" onPress={this.confirmCorrect}/>
          <ChoiceButton text="Wrong!" backgroundColor="red" onPress={this.confirmWrong}/>
        </View>
      </View>
    );
  }

  componentWillUnmount()
  {
    this.manager.destructor();
  }
}

const styles = StyleSheet.create({
  equation:
  {
    flex: 4,
    fontSize: 20,
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
    fontSize: 20
  }
});

class ChoiceButton extends React.Component
{
  //Props: onPress, backgroundColor, text
  render()
  {
    const backgroundColor = this.props.backgroundColor;
    const viewStyle = {...styles.choiceButton, ...{backgroundColor} };
    return (
      <TouchableNativeFeedback onPress={this.props.onPress}>
        <View style={viewStyle}>
          <Text style={styles.choiceText}>{this.props.text}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }

}
