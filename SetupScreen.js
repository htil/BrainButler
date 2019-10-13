//@flow
import React from "react";
import {View, Text, TextInput, TouchableNativeFeedback} from "react-native";

import {MuseDeviceManager} from "react-native-muse";
import RadioForm from "react-native-simple-radio-button";

import Styles from "./Styles.js"
import MuseBanner from "./MuseBanner";
import Config from "./Config.js";

type Props = {};
type State = {patientNumber: string};
export default class SetupScreen extends React.Component<Props, State>
{
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: <MuseBanner title={navigation.getParam("title", "")}/>
    };
  }

  museManager: MuseDeviceManager;
  museSubscription: Subscription<String>;

  constructor(props)
  {
    super(props);
    this.state = {
      patientNumber: Config.patientNumber,
      ip: Config.serverIp,
      ngrok: Config.ngrok
    }

    this.museManager = MuseDeviceManager.getInstance();
    this.museSubscription = this.museManager.devices().subscribe(
      (muses: Array<string>): void => {
        if (muses.length > 0) this.museManager.connect(muses[0]);
      }
    );
  }

  render()
  {
    return (
      <View style={{flex:1}}>
				<TouchableNativeFeedback  onPress={()=>this.museManager.search()}>
					<View style={Styles.button}>
						<Text style={Styles.buttonText}>Search for Muse</Text>
					</View>
				</TouchableNativeFeedback>


        <Label text="Initial Condition"/>
        <RadioForm
          radio_props={
            [{label: "C1", value: "C1"},
             {label: "C2", value: "C2"}]
          }
          initial="C1"
          onPress={value => this.setInitialCondition(value)}
        />

        <Label text="Ngrok Subdomain"/>
        <MyTextInput
          onChangeText={hex => this.setNgrok(hex) }
          value={this.state.ngrok}
        />

        <Label text="IP Address"/>
        <MyTextInput
          onChangeText={ip => this.setIpAddress(ip) }
          value={this.state.ip}
        />

      </View>
    );
  }

  setInitialCondition(cond) { Config.initialCondition = cond; }

  setNgrok(hex) {
    hex = hex.trim();
    Config.ngrok = hex;
    this.setState({ngrok:hex});
  }

  setIpAddress(ip) {
    ip = ip.trim();
    Config.serverIp = ip;
    this.setState({ip});
  }

  setpatientNumber(patientNumber) {
      Config.patientNumber = patientNumber;
      this.setState({patientNumber});
  }
  componentWillUnmount()
  {
    if (this.museSubscription) this.museSubscription.unsubscribe();
  }
}

function MyTextInput(props) {
  return (
   <TextInput
    style={{fontSize: 20, color: "gray", paddingLeft: 20}}
    onChangeText={props.onChangeText}
    value={props.value}
   />
  );

}

function Label(props) {
  return (
    <Text style={{fontSize: 40, paddingLeft: 20}}>{props.text}</Text>
  );
}