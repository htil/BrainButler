import {permutation} from "fy-random";
seedrandom = require("seedrandom");


import ProblemSet from "./ProblemSet";
import {pairs,pairsLE,toSubtraction,noTie,hasCarry} from "./problem_gen";

export default class GrabnerProblems extends ProblemSet {
    problems: Array<string>;

    constructor(seed = 0) {
        super();
        this.random = seedrandom(seed);
        const smalls = this._genSmallSet();
        const larges = this._genLargeSet();

        const operands = smalls.concat(larges);
        const sums = operands.map(prob => `${prob[0]} + ${prob[1]}`);
        const diffs = operands.map(prob => toSubtraction(...prob))
                        .map(prob => `${prob[0]} - ${prob[1]}`);

        const unshuffled = sums.concat(diffs);
        const indices = permutation(unshuffled.length, this.random);

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

    reset() {this.index = 0;}

    length() {return this.problems.length;}

    toArray() {return this.problems.slice();}

    _genSmallSet() {
        //Present 1/2 the small addition problems twice
        const possSmalls = GrabnerProblems._getPossSmalls();
        const [largerAugs, smallerAugs] = partition(possSmalls,largerAug);
        const smalls = [...possSmalls,
                        ...choose(largerAugs,6,this.random),
                        ...choose(smallerAugs,6,this.random)];
        return smalls;
    }

    _genLargeSet() {
        const decades = GrabnerProblems._getLargeDecades();
        let larges = [];
        decades.forEach(decade => {
            const [largerAugs, smallerAugs] = partition(decade,largerAug);
            larges.push(...choose(largerAugs,8,this.random));
            larges.push(...choose(smallerAugs,8,this.random));
        })
        if (larges.length !== 48)
            throw new Exception("larges is not the right length");
        return larges;
    }

    static _getPossSmalls() {
        if (GrabnerProblems.smallProblems !== null) return GrabnerProblems.smallProblems;
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
    return [passed, failed];
}
function largerAug(pair) { return pair[0] > pair[1]; }

function choose(items, r, random = null) {
  const indices = permutation(items.length,random);
  var combination = Array(r).fill(null);
  for (var i = 0; i < r; ++i) combination[i] = items[indices[i]];
  return combination;
}
