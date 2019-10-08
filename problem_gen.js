export function toSubtraction(augend, addend) { return [augend+addend, addend]; }
export function hasCarry(a, b) { return (a % 10) + (b % 10) >= 10; }
export function swapOperands(pair) { return [pair[1], pair[0]]; }
export function noTie(pair) {return pair[0] !== pair[1];}

export function pairs(sum) {
  var opPairs = [];
  for (var augend = 0; augend <= sum; ++augend) opPairs.push([augend, sum-augend]);
  return opPairs;
}

export function pairsLE(sum) {
  return Array.from(Array(sum).keys())
        .map(index => pairs(index + 1))
        .reduce((store, next) => store.concat(next));
}