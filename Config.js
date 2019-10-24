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
    soundPath: "beep.wav",
    delays: {
      problem: 6000,
      warning: 8000,
      darkness: 10000,
      prompt: 13000,
      nextTrial: 22000,
      short: {
        problem: 3000,
        warning: 4000,
        darkness: 5000,
        prompt: 6500,
        nextTrial: 11000
      }
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