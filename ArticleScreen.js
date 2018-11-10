//@flow
import React from "react";
import {View, ScrollView, Text, TouchableNativeFeedback, StyleSheet} from "react-native";
import MuseBanner from "./MuseBanner";
import Orientation from "react-native-orientation";

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
	}
	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		return (
			<View style={{flex:1}}>
  			<ScrollView style={{flex:1}}>
  				<Text>{text}</Text>
  			</ScrollView>
  			<Button text="Rotate the Screen!" onPress={this.rotate}/>
			</View>
		);
	}
}

class Button extends TouchableNativeFeedback
{
  //Props: onPress, text
  render()
  {
    return (
      <TouchableNativeFeedback style={{flex: 1}} onPress={this.props.onPress}>
        <View style={styles.button}>
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
