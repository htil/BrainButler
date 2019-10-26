import GrabnerProblems from "./GrabnerProblems";
import {permutation} from "fy-random";
import seedrandom from "seedrandom";

export default class PracticeProblems {
    constructor(){
        this._index = 0;
        this._random = seedrandom(0);

        const copy = new GrabnerProblems().toArray();
        const indices = permutation(copy.length, this._random);
        this._problems = [];
        for (let i = 0; i < 10; ++i) this._problems.push(copy[indices[i]]); 
    }

    next() {
        if (!this.hasNext()) return null;
        return this._problems[this._index++];
    }

    hasNext() {return this._index < this.length();}
    reset() {this._index = 0;}
    length() {return this._problems.length;}
}