"use strict";
import React, {Component} from "react";
import {ScrollView, Text} from "react-native";

export default class Article extends Component
{
	render()
	{
		const odyssesy = require("./odyssesy")
		const text = odyssesy.text
		return (
			<ScrollView>
				<Text>{text}</Text>
			</ScrollView>
		);
	}
}
