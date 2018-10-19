"use strict";
import React from "react";
import {View, Text, StyleSheet, DeviceEventEmitter} from "react-native";
import {TouchableNativeFeedback} from "react-native";

import GameManager from "./GameManager";

function confirmCorrect()
{
  DeviceEventEmitter.emit("ArtificialGood");
}
function confirmWrong()
{
  DeviceEventEmitter.emit("ArtificialBad");
}

export default class GameScreen extends React.Component
{
  constructor(props)
  {
    super(props);
    this.manager = new GameManager();
  }

  render()
  {
    //var museConnected = this.props.navigation.getParam("museConnected", false);
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 4}}>
          <Text>We are going to play a game</Text>
        </View>
        <View style={{flex: 1, flexDirection: "row"}}>
          <ChoiceButton text="Right!" backgroundColor="green" onPress={confirmCorrect}/>
          <ChoiceButton text="Wrong!" backgroundColor="red" onPress={confirmWrong}/>
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
