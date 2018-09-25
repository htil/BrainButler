"use strict";
import React from "react";
import {Button, View, ScrollView, Text, DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";

import LibMuse from "react-native-libmuse";

import ArticleScreen from "./ArticleScreen";



LibMuse.Init();
LibMuse.StartSearch();
console.log("Started searching for Muse devices. . .");

DeviceEventEmitter.addListener("OnChangeMuseList", args => {
	console.log("The Muse List changed.");
	let [museList] = args;
	if (museList.length > 0)
	{
		LibMuse.Connect();
		console.log("Trying to connect to a detected Muse device. . .");
	}
});

DeviceEventEmitter.addListener("OnReceiveMuseDataPacket", args => {
	let [type, channelValues] = args;
	console.log(`Type: ${type} ChannelValues: ${JSON.stringify(channelValues)}`);
});


class MenuScreen extends React.Component
{
	render()
	{
		const odyssesyText = require("./odyssesy");
		//<Button title="Search for Muse" onPress={()=>{console.log("Pressed Search for Muse")}}/>
		//<Button title="Connect to Muse" onPress={()=>{console.log("Pressed Connect to Muse")}}/>
		//<Button title="Research for Muse" onPress={()=>{console.log("Pressed Research for Muse")}}/>

		return (
			<View>
				<Button title="Read the Odyssesy" onPress={()=>this.props.navigation.navigate("Odyssesy", {text : odyssesyText})}/>
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
