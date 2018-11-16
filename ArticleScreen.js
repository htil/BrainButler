//@flow
import React from "react";
import {View, ScrollView, Text, TouchableNativeFeedback, StyleSheet} from "react-native";
import MuseBanner from "./MuseBanner";
import Orientation from "react-native-orientation";
import SystemSetting from "react-native-system-setting";

export default class ArticleScreen extends React.Component
{
	constructor(props)
	{
		super(props);
		this.rotate = (): void => {
			Orientation.getOrientation((err, orientation) => {
				if (orientation == "LANDSCAPE") Orientation.lockToPortrait();
				else                            Orientation.lockToLandscape();
				Orientation.unlockAllOrientations();
			});
		}

		this.darkenScreen = (): void => {
			//const curr = SystemSetting.getAppBrightness();

			SystemSetting.getAppBrightness().then((curr) =>{
  			const proposed = curr - 0.1;
  			SystemSetting.setAppBrightness(proposed >= 0.1 ? proposed : 0.1);
			});
		};
	}

	awkParagraphs(text: string)
	{
		const paragraphs = text.split("\n")
		  .map(str => str.trim())
			.filter(str => str.length > 0);

		var returnedJSX = [];
		for (let i: number = 0; i < paragraphs.length; ++i)
		{
	    const paragraph: string = paragraphs[i];
			if (i % 2 == 0) returnedJSX.push(
				<View key={i.toString()} style={{flex:1}}><Text numberOfLines={5}>{paragraph}</Text></View>
			);
			else returnedJSX.push(
				<View key={i.toString()} style={{flex:1}}><Text>{paragraph}</Text></View>
			);
		}
		return returnedJSX;
	}

	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		return (
			<View style={{flex:1}}>
  			<ScrollView style={{flex:1}}>
				  {this.awkParagraphs(text)}
  			</ScrollView>
			</View>
		);
	}
}

class Button extends TouchableNativeFeedback
{
  //Props: onPress, text, style
  render()
  {
		const style = styles.button;
    return (
      <TouchableNativeFeedback style={{flex: 1}} onPress={this.props.onPress}>
        <View style={style}>
          <Text style={styles.buttonText}>{this.props.text}</Text>
        </View>
      </TouchableNativeFeedback>
    );
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
