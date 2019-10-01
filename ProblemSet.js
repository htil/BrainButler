import {permutation} from "fy-random";

export default class ProblemSet {
    problems: Array<string>;

    constructor(json) {
        if (json.hasOwnProperty("sums")) {
            this.problems = _readByOperationKeywords(json);
        }
        else {
            throw Exception("Invalid JSON problems format");
        }

        this.index = 0;
    }

    next() {
        if (!this.hasNext()) return null;
        return this.problems[this.index++];
    }

    hasNext() {
        return this.index < this.problems.length;
    }

}

function _readByOperationKeywords(json) {
    let {sums, differences} = json;

    sums = sums.map( ([augend, addend], index) => `${augend} + ${addend}` );
    differences = differences.map(
        ([minuend, subtrahend],index)  => `${minuend} - ${subtrahend}`
    );
    const expressions = sums.concat(differences);

    return permutation(expressions.length).map(
        index => expressions[index]
    );
}
