//@flow
import React from "react";
import {Text} from "react-native";
import {DeviceEventEmitter} from "react-native";
//import MuseManager from "./MuseManager";

import {MuseDeviceManager} from "react-native-muse";
import type {ConnectionPacket, ConnectStatus} from "react-native-bci";
import type {Subscription} from "rxjs";

type Props = {title: string}
type State = {message: string}

export default class MuseBanner extends React.Component<Props, State>
{

  //PUBLIC, INSTANCE
  render()
  {
    const text = this.props.title + ": " + this.state.message;
    return (<Text>{text}</Text>);
  }

  constructor(props: Props, parentState?: State)
  {
    super(props);
    this.manager = MuseDeviceManager.getInstance();

    if (Object.keys(parentState).length > 0) this.state = Object.assign({}, parentState);
    else this.state = {message: MuseBanner.bannerMessage("None", "Unknown")};

    this.subscription = MuseDeviceManager.getInstance()
      .connections().subscribe((packet: ConnectionPacket): void => {
        this.setState(previousState => {
          return {message: MuseBanner.bannerMessage(packet.id, packet.status)};
        });
      });
  }

  componentDidMount()
  {
  }
  componentWillUnmount()
  {
    this.subscription.unsubscribe();
  }

  //PRIVATE, INSTANCE
  manager: MuseDeviceManager;
  subscription: Subscription;

  //PRIVATE, STATIC
  static bannerMessage(museName: string, connectionStatus: ConnectStatus): string
  {
    switch(connectionStatus)
    {
      case "Connecting": return "Connecting to "+museName;
      case "Connected":  return museName +" connected";
      case "Disconnecting": return "Disconnecting from "+museName;
      case "Disconnected":
      default:
        return MuseBanner.disconnectedMessage();
    }
  }

  static disconnectedMessage(): string {return "No headband connected"};
  static titleCase(raw: string): string
  {
    return raw[0].toUpperCase() + raw.slice(1).toLowerCase();
  }
}
