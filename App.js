"use strict";
//React Modules
import React from "react";
import {Button, View, ScrollView, Text, DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";
//Installed modules
import RNLibMuse from "rn-libmuse";
RNLibMuse.Init();
//Local modules
import ArticleScreen from "./ArticleScreen";
import EEG from "./eeg.js";

DeviceEventEmitter.addListener("OnMuseListChanged", (muses) => {
	if (muses.length > 0)
	{
		RNLibMuse.connect(muses[0]);
	}
});
/*
DeviceEventEmitter.addListener("MUSE_EEG", (eeg) => {
	console.log(eeg);
});*/


class MenuScreen extends React.Component
{
	render()
	{
		const odyssesyText = require("./odyssesy");
		return (
			<View>
				<Button title="Read the Odyssesy" onPress={()=>this.props.navigation.navigate("Odyssesy", {text : odyssesyText})}/>
				<Button title="Search/Refresh" onPress={()=>RNLibMuse.search()}/>
			</View>
		);
	}
}

const App = createStackNavigator(
	{
		Menu: {screen: MenuScreen},
		Odyssesy: {screen: ArticleScreen}
	},
	{
		initialRouteName: "Menu"
	}
);

export default App;
