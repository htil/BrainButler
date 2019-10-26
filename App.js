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

		const navigate = this.props.navigation.navigate;
		return (
			<View style={{flex: 1}}>

				<SimpleButton
					onPress={()=>navigate("Experiment", {refresh, title: "Experiment"})}
					text="Experiment"
				/>

				<SimpleButton
					onPress={()=>navigate("Practice", {refresh, practice: true, title: "Practice"} )}
					text="Practice"
				/>

				<SimpleButton
					onPress={()=>navigate("Setup", {title: "Setup"})}
					text="Setup"
				/>
			</View>
		);
	}
}

function SimpleButton(props) {
	return (
		<TouchableNativeFeedback  onPress={props.onPress}>
			<View style={Styles.smallButton}>
				<Text style={Styles.buttonText}>{props.text}</Text>
			</View>
		</TouchableNativeFeedback>
	);
}

function refresh() {
  SystemSetting.setAppBrightness(Config.brightness.full);
}

const App = createStackNavigator(
	{
		Menu: {
			screen: MenuScreen
		},
		Experiment: {
			screen: MathScreen,
			params: {

			}
		},
		Practice: {
			screen: MathScreen,
			params: {

			}
		},
		Setup: {screen: SetupScreen}
	},
	{
	 initialRouteName: "Menu",
	 navigationOptions: ({navigation}) => {return {title: navigation.getParam("title", "")}},
  }
);

export default App;
