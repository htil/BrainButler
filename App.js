"use strict";
//React Modules
import React from "react";
import {Button, View, ScrollView, Text, TouchableNativeFeedback} from "react-native";
import {DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";
//Installed modules
import SystemSetting from "react-native-system-setting";
//Local modules
import MathScreen from "./MathScreen";
import SetupScreen from "./SetupScreen";
import Styles from "./Styles.js";
import Config from "./Config.js";


class MenuScreen extends React.Component
{
  static navigationOptions = {title: "Main Menu"};

	render()
	{
    refresh();

		const odyssesyText = require("./odyssesy");
		const navigate = this.props.navigation.navigate;
		return (
			<View style={{flex: 1}}>

		    <TouchableNativeFeedback  onPress={()=>navigate("Experiment", {refresh, title: "Experiment"})}>
					<View style={Styles.smallButton}>
						<Text style={Styles.buttonText}>Experiment</Text>
					</View>
				</TouchableNativeFeedback>

				<TouchableNativeFeedback  onPress={()=>navigate("Setup", {title: "Setup"})}>
					<View style={Styles.smallButton}>
						<Text style={Styles.buttonText}>Researcher Options</Text>
					</View>
				</TouchableNativeFeedback>
			</View>
		);
	}
}

function refresh() {
  SystemSetting.setAppBrightness(Config.brightness.full);
  console.log("Called refresh");
}

const App = createStackNavigator(
	{
		Menu: {screen: MenuScreen},
		Experiment: {screen: MathScreen},
		Setup: {screen: SetupScreen}
	},
	{
	 initialRouteName: "Menu",
	 navigationOptions: ({navigation}) => {return {title: navigation.getParam("title", "")}},
  }
);

export default App;
