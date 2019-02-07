//@flow
import React from "react";
import {View, ScrollView, Text, TouchableWithoutFeedback, StyleSheet} from "react-native";
import Orientation from "react-native-orientation";
import SystemSetting from "react-native-system-setting";

import Agent from "./Agent";
import Config from "./Config.js";
import Styles from "./Styles";

type Props = {};
type State = {orientation: String};

export default class ArticleScreen extends React.Component<Props, State>
{
	constructor(props)
	{
		super(props);
		this.state = {orientation: Orientation.getInitialOrientation()};
    SystemSetting.setAppBrightness(Config.initialBrightness);

		this.agent = new Agent();
		this.orientListener = (orientation: String): void => {
				this.setState((prev: State): State => {
						return {orientation: orientation};
				});
		};
		Orientation.addOrientationListener(this.orientListener);
	}

	awkParagraphs(text: string)
	{
		const paragraphs = text.split("\n")
		  .map(str => str.trim())
			.filter(str => str.length > 0);

		var returnedJSX = [];
		var remainder: Number = (this.state.orientation == "LANDSCAPE") ? 1 : 0;
		for (let i: number = 0; i < paragraphs.length; ++i)
		{
			if (i > 0)
			{
				returnedJSX.push(<View key={i.toString()+"A"} style={{flex:1}}><Text></Text></View>);
			}
	    const paragraph: string = paragraphs[i];
			if (i % 2 == remainder){
        returnedJSX.push(
				  <View key={i.toString()} style={{flex:1}}>
				    <Text style={Styles.articleText} numberOfLines={5}>{paragraph}</Text>
				  </View>);
			}
			else {
				returnedJSX.push(
				  <View key={i.toString()} style={{flex:1}}>
				    <Text style={Styles.articleText}>{paragraph}</Text>
				  </View>);
	  	}
		}
		return returnedJSX;
	}

	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		return (
			<View style={{flex:1}}>
  			<ScrollView style={{flex:1}}>
					<TouchableWithoutFeedback onPressIn={brighten}>
						<View style={{flex:1}}>
							<Text style={Styles.articleText}>{text}</Text>
						</View>
					</TouchableWithoutFeedback>
  			</ScrollView>
			</View>
		);
	}

	componentWillUnmount()
	{
		Orientation.removeOrientationListener(this.orientListener);
		this.agent.destructor();

		this.props.navigation.state.params.refresh();
	}
}

function brighten() {
	SystemSetting.setAppBrightness(Config.brightness.full);
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
