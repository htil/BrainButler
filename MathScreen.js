//@flow
import {View, Text, StyleSheet} from "react-native";
import React from "react";

//3rd party libraries
import SystemSetting from "react-native-system-setting";

import Agent from "./Agent.js";
import problems from "./problems.json";
import Config from "./Config.js";

type Props = {};
type State = {warningText: String, text: String};
export default class MathScreen extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state  = {text: problems[0].text, warningText: ""};

    this.agent = new Agent();

    this.probIndex = 0;
    this.callbackIds = [];

    this.callbackIds.push(setInterval(() => {
      this.probIndex = (this.probIndex + 1) % problems.length;
      this.setState((prev) => {
        return {text: problems[this.probIndex].text}
      });
    }, 5000));

    this.callbackIds.push(setInterval(() => {
      this.setState((prev) => {
        const text = prev.text;
        return {text, warningText: "About to darken"};
      });

      setTimeout(() => {
        this.agent.darkenScreen();
        this.setState((prev) => {
          return {text: prev.text, warningText: ""}
        })
      }, 1000);

    }, 5000));

  }

  render() {
    const flexPadding = styles.equation.flex;
    return (
      <View style={{flex: 1}}>
        <View style={{flex: flexPadding}}>
          <Text style={styles.warningText}>{this.state.warningText}</Text>
        </View>
        <View style={styles.equation}>
          <Text style={styles.equationText}>{this.state.text}</Text>
        </View>
        <View style={{flex: flexPadding}}></View>
      </View>
    );
  }

  componentWillUnmount() {
    this.callbackIds.forEach((id) => clearInterval(id));
    this.agent.destructor();

    SystemSetting.setAppBrightness(Config.brightness.full);
  }

}

const styles = StyleSheet.create({
  warningText:
  {
      fontSize: 40,
      color: "blue",
      fontWeight: "bold",
      textAlign: "center",
  },
  equation:
  {
    flex: 1,
  },
  equationText:
  {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center"
  }
});
