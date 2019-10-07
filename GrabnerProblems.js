import {permutation} from "fy-random";
import ProblemSet from "./ProblemSet";

import {pairsLE,toSubtraction,noTie,hasCarry} from "./problem_gen";
import { DH_CHECK_P_NOT_SAFE_PRIME } from "constants";

const assert = require("assert");

class GrabnerProblems extends ProblemSet {
    problems: Array<string>;

    constructor(seed = 0) {
        super();

        const smalls = this._genSmallSet();
        const larges = this._genLargeSet();

        const operands = smalls.concat(larges);
        const sums = operands.map(prob => `${prob[0]} + ${prob[1]}`);
        const diffs = operands.map(prob => toSubtraction(...prob))
                        .map(prob => `${probs[0]} - ${prob[1]}`);

        const unshuffled = sums.concat(diffs);
        const indices = permutation(unshuffled.length);

        this.problems = indices.map(ind => unshuffled[ind]);
        this.index = 0;
    }

    next() {
        if (!this.hasNext()) return null;
        return this.problems[this.index++];
    }

    hasNext() {
        return this.index < this.problems.length;
    }

    _genSmallSet() {
        //Present 1/2 the small addition problems twice
        let smalls = this._getPossSmalls();
        assert(smalls.length === 24);

        const [largerAugs, smallerAugs] = smalls.partition(largerAug);
        smalls.push( choose(largerAugs,6) );
        smalls.push( choose(smallerAugs,6) );
        assert(smalls.length === 36);
        return smalls;
    }

    _genLargeSet() {
        const decades = GrabnerProblems._getLargeDecades();
        let larges = [];
        for (var decade in decades) {
            const [largerAugs, smallerAugs] = decade.partition(largerAug);
            larges.push(...choose(largerAugs,8));
            larges.push(...choose(smallerAugs,8));
        }
        assert(larges.length === 48);
        return larges;
    }

    static _getPossSmalls() {
        if (GrabnerProblems.smallProblems !== null)
            return GrabnerProblems.smallProblems;

        GrabnerProblems.smallProblems = pairsLE(10)
            .filter(pair => pair[0] > 1 && pair[1] > 1) //No one or zero problems
            .filter(noTie); 
        return GrabnerProblems.smallProblems;
    }

    static _getLargeDecades() {
        if (GrabnerProblems.largeDecades !== null)
            return GrabnerProblems.largeDecades;

        var decades = [];
        for (var i = 11; i < 40; i += 10) {
            var decade = [];
            for (var sum = i; sum < i + 9; ++sum)
                decade = decade.concat(pairs(sum));
            decade = decade.filter(pair => hasCarry(...pair))
                            .filter(noTie);
            decades.push(decade);
        }
        GrabnerProblems.largeDecades = decades;
        return GrabnerProblems.largeDecades;
    }

    static smallProblems = null;
    static largeDecades = null;

}

function partition(arr, pred) {
    let passed = [];
    let failed = [];

    arr.forEach(element => {
        if (pred(element)) passed.push(element);
        else               failed.push(element);
    });
}
function largerAug(pair) { return pair[0] > pair[1]; }

function choose(items, r) {
  const indices = randomIndices(items.length);
  var combination = Array(r).fill(null);
  for (var i = 0; i < r; ++i) combination[i] = items[indices[i]];
  return combination;
}
