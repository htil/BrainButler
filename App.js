"use strict";
//React Modules
import React from "react";
import {Button, View, ScrollView, Text, StyleSheet, TouchableNativeFeedback} from "react-native";
import {DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";
//Installed modules
import RNLibMuse from "rn-libmuse";
//Local modules
import ArticleScreen from "./ArticleScreen";
import GameScreen from "./GameScreen";
import MuseBanner from "./MuseBanner";
import {eeg_observable} from "./eeg.js";

const EPOCH_SIZE = 256; //Number of samples in an epoch
const EPOCH_INTERVAL = 100; //ms between emitted epochs

RNLibMuse.Init();
RNLibMuse.setBufferSize(64);
DeviceEventEmitter.addListener("OnMuseListChanged", (muses) => {
	if (muses.length > 0)
	{
		RNLibMuse.connect(muses[0]);
	}
});

const eeg_stream = eeg_observable(EPOCH_SIZE, EPOCH_INTERVAL);
eeg_stream.subscribe(eeg_packet => {
	console.log(eeg_packet);
});

const styles = StyleSheet.create({
	button:
	{
		flex: 1,
		backgroundColor: "blue",
		margin: 10
	},
	buttonText:
	{
		color: "white",
		textAlign: "center",
		fontSize: 24
	}

});

class MenuScreen extends React.Component
{
  static navigationOptions = {headerTitle: <MuseBanner title="Main Menu"/>};

	render()
	{
		const odyssesyText = require("./odyssesy");
		const navigate = this.props.navigation.navigate;
		return (
			<View style={{flex: 1}}>
			  <TouchableNativeFeedback onPress={()=>navigate("Odyssesy", {text: odyssesyText, title: "The Odyssesy"})}>
				  <View style={styles.button}>
					  <Text style={styles.buttonText}>Read the Odyssesy</Text>
				  </View>
			  </TouchableNativeFeedback>

				<TouchableNativeFeedback  onPress={()=>RNLibMuse.search()}>
					<View style={styles.button}>
						<Text style={styles.buttonText}>Search/Refresh</Text>
					</View>
				</TouchableNativeFeedback>

				<TouchableNativeFeedback  onPress={()=>navigate("Game", {title: "Train BrainButler"})}>
					<View style={styles.button}>
						<Text style={styles.buttonText}>Train BrainButler</Text>
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
		Game: {screen: GameScreen}
	},
	{
		initialRouteName: "Menu",
		navigationOptions: ({navigation}) => {
			return {headerTitle: <MuseBanner title={navigation.getParam("title", "")}/>};
		}
	}
);

export default App;
