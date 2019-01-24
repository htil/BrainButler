//@flow
import {Alert} from "react-native";

import SystemSetting from "react-native-system-setting";

import Config from "./Config";

const title: String = "Hey!";
const brightenMessage: String =
  "It seemed like you were still looking, so I brightened the screen!";


function positiveResponse() {}
function negativeResponse() {}

function brightenScreen() {
	 SystemSetting.getAppBrightness().then((curr) => {
		 SystemSetting.setAppBrightness(Config.brightness.full);

     Alert.alert(title, brightenMessage,
       [
         {text: "Thanks", onPress: positiveResponse},
         {text: "No Thanks", onPress: negativeResponse}
       ]
     );
	 });
}

export default {brightenScreen};
