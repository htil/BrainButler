const assert = require("assert");

function toSubtraction(augend, addend) { return [augend+addend, addend]; }
function hasCarry(a, b) { return (a % 10) + (b % 10) >= 10; }
function swapOperands(pair) { return [pair[1], pair[0]]; }
function randomSwap(pair) { return (Math.random() <= .5) ? pair : swapOperands(pair);}
function noTie(pair) {return pair[0] !== pair[1];}

function pairs(sum) {
  var opPairs = [];
  for (var augend = 0; augend <= sum; ++augend) opPairs.push([augend, sum-augend]);
  return opPairs;
}

function pairsLE(sum) {
  return Array.from(Array(sum).keys())
        .map(index => pairs(index + 1))
        .reduce((store, next) => store.concat(next));
}


function problemSet() {

  /*

  var large = [];
  for (var i = 11; i < 40; i += 10) {
    var decade = [];
    for (var sum = i; sum < i + 9; ++sum) decade = decade.concat(pairs(sum));
    large = large.concat( choose( decade.filter(pair => hasCarry(...pair)), 16) );
  }

  */
}