//@flow
import React from "react";
import {View, Text, TextInput, TouchableNativeFeedback} from "react-native";
import {MuseDeviceManager} from "react-native-muse";

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

        <Text style={{fontSize: 40, paddingLeft: 20}}>
         Patient Code
        </Text>

        <TextInput
          style={{fontSize: 20, color: "gray", paddingLeft: 20}}
          onChangeText={(code) => this.setpatientNumber(code)}
          value={this.state.patientNumber}
        />

      </View>
    );
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
