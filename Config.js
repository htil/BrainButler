//@flow
var settings = {
    brightness: {
      full: 1.0, medium: 0.5, low: 0.1
    },
    initialBrightness: 1.0,
    initialCondition: "C1",
    serverIp: "127.0.0.1",
    serverPort: 3001,
    ngrok: "",

    delays: {
      problem: 3000,
      warning: 5000,
      darkness: 7000,
      prompt: 10000,
      nextTrial: 13000
    },

}

function ordered(...delays) {
  for (let i = 1; i < delays.length; ++i)
    if (delays[i-1] > delays[i]) return false;
  return true;
}

const delays = settings.delays;
if (!ordered(delays.problem,delays.warning,delays.darkness,delays.prompt,delays.nextTrial))
  throw "Must have delays.(problem < warning < darkness < prompt < nextTrial)";

export default settings;