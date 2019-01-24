//@flow
import props from "./props.json";


function edfDate(date) {
        let day = new String(date.getDate());
        let month = new String(date.getMonth() + 1);
        let year = new String(date.getFullYear());
        day = (day.length < 2) ? "0"+day : day;
        month = (month.length < 2) ? "0"+month : month;
        return `${day}.${month}.${year}`;
}
function edfTime(date) {
        let hour = new String(date.getHours());
        let minute = new String(date.getMinutes());
        let second = new String(date.getSeconds());
        hour =   (hour.length < 2)   ? "0"+hour   : hour;
        minute = (minute.length < 2) ? "0"+minute : minute;
        second = (second.length < 2) ? "0"+second : second;
        return `${hour}.${minute}.${second}`;
}

export default settings = {
    brightness: {
      full: 1.0, medium: 0.5, low: 0.1
    },
    initialBrightness: 1.0,
    sampleFrequency: 256,
    highpass: 1,
    lowpass: 30,
    labPrefix: "HTIL",
    patientNumber: "0",
    serverUri: `ws://${props.ip}:${props.port}`
}
export function edfHeader() {
    const labels = ["EEG1", "EEG2", "EEG3", "EEG4"];
    const sampleFrequency = labels.map(label => settings.sampleFrequency);
    const prefilter = labels.map(
      label => `HP:${settings.highpass}Hz LP:${settings.lowpass}Hz`);
    const physicalDimension = labels.map(label => "uV");

    const dateObj = new Date(Date.now());
    const startDate = edfDate(dateObj);
    const startTime = edfTime(dateObj);

    const patientCode = `${settings.labPrefix}-${settings.patientNumber}`;

    return {labels, sampleFrequency, startDate,
      startTime, prefilter, physicalDimension, patientCode};
}
