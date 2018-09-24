"use strict";
import React from "react";
import {Button, View, ScrollView, Text} from "react-native";

import {createStackNavigator} from "react-navigation";

class OdyssesyScreen extends React.Component
{
	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		console.log(text);
		return (
			<ScrollView>
				<Text>{text}</Text>
			</ScrollView>
		);
	}
}

class MenuScreen extends React.Component
{
	render()
	{
		const odyssesyText = require("./odyssesy");
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
		Odyssesy: {screen: OdyssesyScreen}
	},
	{
		initialRouteName: "Menu"
	}
);

export default App;
