//@flow
import React from "react";
import {View, ScrollView, Text, TouchableNativeFeedback, StyleSheet} from "react-native";
import {Alert} from "react-native";
import Orientation from "react-native-orientation";
import SystemSetting from "react-native-system-setting";

import {merge} from "rxjs";

import Config from "./Config.js";
import MuseBanner from "./MuseBanner";
import Styles from "./Styles";
import {eegObservable, accObservable, gyroObservable} from "./Streaming.js";

type Props = {};
type State = {orientation: String};

export default class ArticleScreen extends React.Component<Props, State>
{
	constructor(props)
	{
		super(props);

		this.eegBuffer = [];
		this.orientBuffer = [];
		this.gyroBuffer = [];
		this.accBuffer = [];
		this.subscriptions = [];

		this.state = {orientation: Orientation.getInitialOrientation()};
		this.orientListener = (orientation: String): void => {
				this.setState((prev: State): State => {
						return {orientation: orientation};
				});
		};
		Orientation.addOrientationListener(this.orientListener);

		this.subscriptions.push( eegObservable.subscribe((packet) => {
			this.eegBuffer.push(packet);
			if (Config.sampleFrequency <= this.eegBuffer.length)
			{
				//console.log(`EEG Buffer length = ${this.eegBuffer.length}`);
				this.eegBuffer = [];
			}
		}));

		this.subscriptions.push( gyroObservable.subscribe((packet) => {
			this.gyroBuffer.push(packet);
			if (Config.sampleFrequency <= this.gyroBuffer.length)
			{
				this.gyroBuffer = [];
			}
		}));

		this.subscriptions.push( accObservable.subscribe((packet) => {
			this.accBuffer.push(packet);
			if (Config.sampleFrequency <= this.accBuffer.length)
			{
				this.accBuffer = [];
			}
		}));

		this.rotate = (): void => {
			Orientation.getOrientation((err, orientation) => {
				if (orientation == "LANDSCAPE") Orientation.lockToPortrait();
				else                            Orientation.lockToLandscape();
				Orientation.unlockAllOrientations();
			});
		}

		this.darkenScreen = (): void => {
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
				  {this.awkParagraphs(text)}
  			</ScrollView>
			</View>
		);
	}

	componentWillUnmount()
	{
		console.log("Unsubscribing the observers . . .");
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		console.log("Unsubscribed.");
		this.subscriptions = [];

		Orientation.removeOrientationListener(this.orientListener);
		console.log("Unmounted component");
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
