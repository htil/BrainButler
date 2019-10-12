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
    this.state = {patientNumber: Config.patientNumber};

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

        <Label text="Patient Number"/>
        <TextInput
          style={{fontSize: 20, color: "gray", paddingLeft: 20}}
          onChangeText={(code) => this.setpatientNumber(code)}
          value={this.state.patientNumber}
        />

        <Label text="Initial Condition"/>
        <RadioForm
          radio_props={
            [{label: "C1", value: "C1"},
             {label: "C2", value: "C2"}]
          }
          initial="C1"
          onPress={value => this.setInitialCondition(value)}
        />

      </View>
    );
  }

  setInitialCondition(cond) { Config.initialCondition = cond; }

  setpatientNumber(patientNumber) {
      Config.patientNumber = patientNumber;
      this.setState({patientNumber});
  }
  componentWillUnmount()
  {
    if (this.museSubscription) this.museSubscription.unsubscribe();
  }
}

function Label(props) {
  return (
    <Text style={{fontSize: 40, paddingLeft: 20}}>{props.text}</Text>
  );
}