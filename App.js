"use strict";
import React from "react";
import {Button, View, ScrollView, Text, DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";
import ArticleScreen from "./ArticleScreen";


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
