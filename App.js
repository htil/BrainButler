"use strict";
//React Modules
import React from "react";
import {Button, View, ScrollView, Text, TouchableNativeFeedback} from "react-native";
import {DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";
//Installed modules
import {MuseDeviceManager} from "react-native-muse";
import {Accelerometer, Gyroscope} from "react-native-sensors";
//Local modules
import ArticleScreen from "./ArticleScreen";
import SetupScreen from "./SetupScreen";
import GameScreen from "./GameScreen";
import MuseBanner from "./MuseBanner";
import Styles from "./Styles.js";


class MenuScreen extends React.Component
{
  static navigationOptions = {title: "Main Menu"};

	render()
	{
		const odyssesyText = require("./odyssesy");
		const navigate = this.props.navigation.navigate;
		return (
			<View style={{flex: 1}}>
			  <TouchableNativeFeedback onPress={()=>navigate("Odyssesy", {text: odyssesyText, title: "The Odyssesy"})}>
				  <View style={Styles.button}>
					  <Text style={Styles.buttonText}>Read the Odyssesy</Text>
				  </View>
			  </TouchableNativeFeedback>

				<TouchableNativeFeedback  onPress={()=>navigate("Game", {title: "Train BrainButler"})}>
					<View style={Styles.button}>
						<Text style={Styles.buttonText}>Train BrainButler</Text>
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

const App = createStackNavigator(
	{
		Menu: {screen: MenuScreen},
		Odyssesy: {screen: ArticleScreen},
		Game: {screen: GameScreen},
		Setup: {screen: SetupScreen}
	},
	{
	 initialRouteName: "Menu",
	 navigationOptions: ({navigation}) => {return {title: navigation.getParam("title", "")}},
  }
);

export default App;
