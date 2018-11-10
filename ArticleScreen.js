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
	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		return (
			<View style={{flex:1}}>
  			<ScrollView style={{flex:1}}>
  				<Text>{text}</Text>
  			</ScrollView>
  			<Button text="Darken the screen!" style={{backgroundColor:"green"}}
  			  onPress={this.darkenScreen}/>
  			<Button text="Rotate the Screen!" onPress={this.rotate}/>
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
