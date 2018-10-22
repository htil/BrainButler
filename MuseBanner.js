"use strict";
import React from "react";
import {Text} from "react-native";
import {DeviceEventEmitter} from "react-native";
import MuseManager from "./MuseManager";

export default class MuseBanner extends React.Component
{
  //Props: title
  //State: message
  render()
  {
    const text = this.props.title + ": " + this.state.message;
    return (<Text>{text}</Text>);
  }

  constructor(props)
  {
    super(props);
    this.manager = MuseManager.getInstance();

    this.state = {
      message: MuseBanner.bannerMessage(this.manager.museName, this.manager.connectionStatus)
    };
    this.statusCallback = (museName, connectionStatus) => {
      console.log("Called statusCallback");
      this.setState(previousState => {
        return {message: MuseBanner.bannerMessage(museName, connectionStatus)};
      });
    };

    this.manager.subscribeConnectionState(this.statusCallback);
  }

  static bannerMessage(museName, connectionStatus)
  {
    switch(connectionStatus)
      {
        case "CONNECTING":
          return "Connecting to "+museName;
          break;
        case "CONNECTED":
          return museName +" connected";
          break;
        case "DISCONNECTING":
          return "Disconnecting from "+museName;
          break; //Yes this is unreachable, but just in case. . .
        case "DISCONNECTED":
        default:
          return MuseBanner.disconnectedMessage();
          break;
      }
  }

  static disconnectedMessage(){return "No headband connected"};
  static titleCase(raw)
  {
    return raw[0].toUpperCase() + raw.slice(1).toLowerCase();
  }

  componentDidMount()
  {
  }
  componentWillUnmount()
  {
    this.manager.unsubscribeConnectionState(this.statusCallback);
  }

}
