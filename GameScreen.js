"use strict";
import React from "react";
import {View, Text, DeviceEventEmitter} from "react-native";
import MuseBanner from "./MuseBanner";

export default class GameScreen extends React.Component
{
  render()
  {
    var museConnected = this.props.navigation.getParam("museConnected", false);
    if (!museConnected)
    {
      return (
        <View><Text>Go back to the main menu and connect a Muse first.</Text></View>
      );
    }

    return (
      <View><Text>We are going to play a simple gave to train BrainButler.</Text></View>
    );
  }
}
