//@flow
import React from "react";
import {View, ScrollView, Text, TouchableWithoutFeedback, StyleSheet} from "react-native";
import SystemSetting from "react-native-system-setting";

import Agent from "./Agent";
import Config from "./Config.js";
import Styles from "./Styles";

type Props = {};
type State = {};

export default class ArticleScreen extends React.Component<Props, State>
{
	constructor(props)
	{
		super(props);
		this.state = {};
    SystemSetting.setAppBrightness(Config.initialBrightness);

		this.agent = new Agent();
	}

	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		return (
			<View style={{flex:1}}>
  			<ScrollView style={{flex:1}}>
					<TouchableWithoutFeedback onPressIn={ () => {this.brighten()} }>
						<View style={{flex:1}}>
							<Text style={Styles.articleText}>{text}</Text>
						</View>
					</TouchableWithoutFeedback>
  			</ScrollView>
			</View>
		);
	}

	brighten() {
		this.agent.brightenScreen();
	}

	componentWillUnmount()
	{
		this.agent.destructor();

		this.props.navigation.state.params.refresh();
	}
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "blue",
	},
	buttonText: {
		color: "white",
		fontSize: 60,
		textAlign: "center"
	}
});
