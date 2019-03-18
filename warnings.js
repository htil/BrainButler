//@flow

function warn(view: Object) {
    view.setState((prev) => {
      const text = prev.text;
      return {text, warningText: "About to darken"};
    });
    view.controller.recordEvent({
      type: "event", name: "dispWarning",
      value: true, timestamp: Date.now()
    });
}
function removeWarning(view: Object) {
  view.setState((prev) => {
      return {text: prev.text, warningText: ""}
  });
  view.controller.recordEvent({
    type: "event", name: "dispWarning",
    value: false, timestamp: Date.now()
  });
}

module.exports.warn = warn;
module.exports.removeWarning = removeWarning;
