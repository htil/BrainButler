"use strict";
import React from "react";
import {ScrollView, Text} from "react-native";
import MuseBanner from "./MuseBanner";

export default class ArticleScreen extends React.Component
{
	render()
	{
		const {text} = this.props.navigation.getParam("text", "");
		return (
			<ScrollView>
				<Text>{text}</Text>
			</ScrollView>
		);
	}
}
