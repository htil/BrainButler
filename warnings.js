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
      if (prev.warningText.length > 0)
        view.controller.recordEvent({
          type: "event", name: "dispWarning",
          value: false, timestamp: Date.now()
        });

      return {text: prev.text, warningText: ""}
  });
}

module.exports.warn = warn;
module.exports.removeWarning = removeWarning;
