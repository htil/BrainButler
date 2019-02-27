"use strict";
//React Modules
import React from "react";
import {Button, View, ScrollView, Text, TouchableNativeFeedback} from "react-native";
import {DeviceEventEmitter} from "react-native";
import {createStackNavigator} from "react-navigation";
//Installed modules
import SystemSetting from "react-native-system-setting";
//Local modules
import ArticleScreen from "./ArticleScreen";
import SetupScreen from "./SetupScreen";
import MuseBanner from "./MuseBanner";
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
			  <TouchableNativeFeedback onPress={
          ()=>navigate("Odyssesy",
            {refresh, text: odyssesyText, title: "The Odyssesy"}
        )}>
				  <View style={Styles.button}>
					  <Text style={Styles.buttonText}>Read the Odyssesy</Text>
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
}

const App = createStackNavigator(
	{
		Menu: {screen: MenuScreen},
		Odyssesy: {screen: ArticleScreen},
		Setup: {screen: SetupScreen}
	},
	{
	 initialRouteName: "Menu",
	 navigationOptions: ({navigation}) => {return {title: navigation.getParam("title", "")}},
  }
);

export default App;
