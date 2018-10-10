"use strict";
import {DeviceEventEmitter} from "react-native";
import bci from "bci";

const EPOCH_RATE = 2000; //Take out an epoch every 250ms
const EPOCH_LENGTH = 1000; //Take 1000 ms epochs\
const NUM_SAMPLES = 250;

var eeg_full = [];

/**
 * Returns the index of an element in items close to value
 */
function index_closest(items, value)
{
  let low = 0;
  let high = items.length - 1;
  let curr_index = -1; //Returns -1 for an empty list
  let index_closest = curr_index;
  let min_diff = Infinity;

  while (low <= high)
  {
    curr_index = Math.floor((low + high) / 2);
    let queried = items[curr_index];
    if      (queried == value) return curr_index;
    else if (queried < value)  low = curr_index + 1;
    else                       high = curr_index - 1;

    let diff = Math.abs(queried - value);
    if (diff < min_diff)
    {
      min_diff = diff;
      index_closest = curr_index;
    }
  }
  return index_closest;
}

function epoch_eeg(eeg_data, epoch_length)
{
    if (eeg_data.length < 1) return null;
    let max_time = eeg_data[eeg_data.length-1].timestamp;
    let min_time = max_time - epoch_length;
    let epoch_start = index_closest(eeg_data.map(packet => packet.timestamp), min_time);
    return eeg_data.slice(epoch_start);
}

function downsample_epoch(epoch, num_samples)
{
  if (epoch == null || epoch.length <= num_samples)     return null;
  else if (epoch.length > num_samples) return epoch.slice(epoch.length - num_samples); //TODO: Use a good resampling algorithm
  else                                 return epoch;
}

DeviceEventEmitter.addListener("MUSE_EEG", (eeg_packet) => {
  eeg_full.push(eeg_packet);
});


setInterval(() => {
  let epoched = epoch_eeg(eeg_full, EPOCH_LENGTH);
  //epoched = downsample_epoch(epoched, NUM_SAMPLES);
  if (epoched != null)
  {
    console.log("Epoch of size "+epoched.length);
    console.log("\t"+epoched[0].timestamp);
    console.log("\t"+epoched[epoched.length-1].timestamp);
  }
}, EPOCH_RATE);


export default 42;
