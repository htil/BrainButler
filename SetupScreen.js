//@flow
import React from "react";
import {View, Text, TouchableNativeFeedback} from "react-native";
import {MuseDeviceManager} from "react-native-muse";

import Styles from "./Styles.js"
import MuseBanner from "./MuseBanner";

type Props = {};
type State = {};
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

    this.museManager = MuseDeviceManager.getInstance();
    this.museSubscription = this.museManager.devices().subscribe(
      (muses: Array<string>): void => {
        if (muses.length > 0) this.museManager.connect(muses[0]);
      }
    );
    //this.search = this.museManager.search;
  }

  render()
  {
    return (
      <View style={{flex:1}}>
        <View style={{flex:Styles.button.flex}}></View>
				<TouchableNativeFeedback  onPress={()=>this.museManager.search()}>
					<View style={Styles.button}>
						<Text style={Styles.buttonText}>Search for Muse</Text>
					</View>
				</TouchableNativeFeedback>
        <View style={{flex:Styles.button.flex}}></View>
      </View>
    );
  }

  componentWillUnmount()
  {
    if (this.museSubscription) this.museSubscription.unsubscribe();
  }

}
