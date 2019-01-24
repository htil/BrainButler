//@flow
import React from "react";
import {View, ScrollView, Text, TouchableNativeFeedback, StyleSheet} from "react-native";
import {Alert} from "react-native";
import Orientation from "react-native-orientation";
import SystemSetting from "react-native-system-setting";

import {merge} from "rxjs";

import Agent from "./Agent";
import Config from "./Config.js";
import BBSocket from "./BBSocket.js";
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
		this.state = {orientation: Orientation.getInitialOrientation()};
    SystemSetting.setAppBrightness(Config.initialBrightness);

		this.eegBuffer = [];
		this.subscriptions = [];
		this.callbackIds = [];

		this.socket = BBSocket.getInstance();

 		this.subscriptions.push(this.socket.actions().subscribe((action) => {
			console.log("Received action "+action);
			if (action == "brighten"){
					Agent.brightenScreen();
			}
		}));

		this.socket.open(() => {
			this.socket.send(JSON.stringify({type: "header", body: {}}));

			Orientation.getOrientation((err, orientation) => {
				this.socket.send(JSON.stringify({
					type: "event",
					body: {eventName: "rotation", orientation, timestamp: Date.now()}
				}));
			});

			SystemSetting.getAppBrightness().then((curr) => {
				this.socket.send(JSON.stringify({
					type: "event",
					body: {eventName: "brightness", brightness: curr, timestamp: Date.now()}
				}));
			});

		});

		this.orientListener = (orientation: String): void => {
				const timestamp = Date.now();
				this.setState((prev: State): State => {
						return {orientation: orientation};
				});
				this.socket.send(JSON.stringify(
					{type: "event", body: {eventName: "rotation", orientation, timestamp}}
				));
		};
		Orientation.addOrientationListener(this.orientListener);

		this.subscriptions.push( eegObservable.subscribe((packet) => {
			this.eegBuffer.push(packet);
			if (Config.sampleFrequency <= this.eegBuffer.length)
			{
				this.socket.send(JSON.stringify({type: "data", body: this.eegBuffer}));
				this.eegBuffer = [];
			}
		}));

		this.callbackIds.push( setInterval(() => {this.darkenScreen()}, 5000) );

	}

	static rotate() {
			Orientation.getOrientation((err, orientation) => {
				if (orientation == "LANDSCAPE") Orientation.lockToPortrait();
				else                            Orientation.lockToLandscape();
				Orientation.unlockAllOrientations();
			});

	}

	darkenScreen() {
			SystemSetting.getAppBrightness().then((curr) =>{

				let newSetting = curr;
				if (curr == Config.brightness.full)
					newSetting = Config.brightness.medium;
				else if (curr == Config.brightness.medium)
					newSetting = Config.brightness.low;

				if ( newSetting < curr ) {
					const timestamp = Date.now();
					this.socket.send(JSON.stringify(
						{type: "event", body: {eventName: "brightness", timestamp, brightness: newSetting}}
					));
				}
  			SystemSetting.setAppBrightness(newSetting);
			});
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
		Orientation.removeOrientationListener(this.orientListener);
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
		this.subscriptions = [];

		this.callbackIds.forEach(callbackId => clearInterval(callbackId));
		this.callbackIds = [];

    this.socket.send(JSON.stringify({type: "eof"}));
		this.socket.close();

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
