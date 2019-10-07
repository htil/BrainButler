//@flow

function warn(view: Object) {
    view.setState((prev) => {
      const text = prev.text;
      return {text, warningText: "About to darken"};
    });

}
function removeWarning(view: Object) {
  view.setState((prev) => {
      if (prev.warningText.length > 0) {

      }

      return {text: prev.text, warningText: ""}
  });
}

module.exports.warn = warn;
module.exports.removeWarning = removeWarning;
