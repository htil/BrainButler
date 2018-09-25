"use strict";
import React from "react";
import {Button, View, ScrollView, Text} from "react-native";
import {createStackNavigator} from "react-navigation";

import ArticleScreen from "./ArticleScreen";

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
		Odyssesy: {screen: ArticleScreen}
	},
	{
		initialRouteName: "Menu"
	}
);

export default App;
