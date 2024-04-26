import assert from "node:assert/strict";
import optimize from "../src/optimizer.js";
import * as core from "../src/core.js";

// // Make some test cases easier to read
const x = core.variable("x", false, core.numberType);
const less = (x, y) => core.binaryExpression("<", x, y);
const or = (...d) => d.reduce((x, y) => core.binaryExpression("or", x, y));
const and = (...c) => c.reduce((x, y) => core.binaryExpression("and", x, y));
const list = (...elements) => core.listExpression(elements);
const onePlusTwo = core.binaryExpression("+", 1, 2, core.numberType);
const sub = (a, e) => core.subscript(a, e);
const a = core.variable("a", false, core.listType(core.numberType));

const tests = [
  ["folds +", core.binaryExpression("+", 5, 8), 13],
  ["folds -", core.binaryExpression("-", 5n, 8n), -3n],
  ["folds *", core.binaryExpression("*", 5, 8), 40],
  ["folds /", core.binaryExpression("/", 5, 8), 0.625],
  ["folds **", core.binaryExpression("**", 5, 8), 390625],
  ["folds <", core.binaryExpression("<", 5, 8), true],
  ["folds <=", core.binaryExpression("<=", 5, 8), true],
  ["folds ==", core.binaryExpression("==", 5, 8), false],
  ["folds !=", core.binaryExpression("!=", 5, 8), true],
  ["folds >=", core.binaryExpression(">=", 5, 8), false],
  ["folds >", core.binaryExpression(">", 5, 8), false],
  ["optimizes +0", core.binaryExpression("+", x, 0), x],
  ["optimizes -0", core.binaryExpression("-", x, 0), x],
  ["optimizes *1", core.binaryExpression("*", x, 1), x],
  ["optimizes /1", core.binaryExpression("/", x, 1), x],
  ["optimizes *0", core.binaryExpression("*", x, 0), 0],
  ["optimizes 0*", core.binaryExpression("*", 0, x), 0],
  ["optimizes 0/", core.binaryExpression("/", 0, x), 0],
  ["optimizes 0+", core.binaryExpression("+", 0, x), x],
  ["optimizes 1*", core.binaryExpression("*", 1, x), x],
  ["optimizes 1**", core.binaryExpression("**", 1, x), 1],
  ["optimizes **0", core.binaryExpression("**", x, 0), 1],
  ["removes left false from or", or(false, less(x, 1)), less(x, 1)],
  ["removes right false from or", or(less(x, 1), false), less(x, 1)],
  ["removes left true from and", and(true, less(x, 1)), less(x, 1)],
  ["removes right true from and", and(less(x, 1), true), less(x, 1)],
  ["optimizes in subscripts", sub(a, onePlusTwo), sub(a, 3)],
  ["optimizes in array literals", list(0, onePlusTwo, 9), list(0, 3, 9)],
  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      core.program([core.returnStatement()]),
      core.variableDeclaration("x", true, "z"),
      core.assignmentStatement(x, core.binaryExpression("*", x, "z")),
      core.variableDeclaration("q", false, core.emptyListExpression(core.numberType)),
      core.ifStatement(x, [], []),
    ]),
  ],
];

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after);
    });
  }
});
