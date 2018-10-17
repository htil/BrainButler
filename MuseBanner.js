"use strict";
import React from "react";
import {Text} from "react-native";
import {DeviceEventEmitter} from "react-native";
import MuseManager from "./MuseManager";

export default class MuseBanner extends React.Component
{
  //Props: title
  //State: muse

  constructor(props)
  {
    super(props);
    this.state = {muse: MuseManager.getInstance().muse};

    this.connectCallback = (museName) => {
      this.setState(previousState => {
        return {muse: museName};
      });
    };

    this.disconnectCallback = (museName) => {
      this.setState(previousState => {
        return {muse: null};
      });
    }
  }

  componentDidMount()
  {
    console.log("About to call DeviceEventEmitter");
    DeviceEventEmitter.addListener("OnMuseConnect", this.connectCallback);
    DeviceEventEmitter.addListener("OnMuseDisconnect", this.disconnectCallback);
  }
  componentWillUnmount()
  {
    DeviceEventEmitter.removeListener("OnMuseConnect", this.connectCallback);
    DeviceEventEmitter.removeListener("OnMuseDisconnect", this.disconnectCallback);
  }

  render()
  {
    var text;
    if (this.state.muse) text = this.props.title + ": Connected to " + this.state.muse;
    else                 text = this.props.title + ": No Muse connected";

    return (<Text>{text}</Text>);
  }
}
