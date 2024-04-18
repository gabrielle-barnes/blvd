console.log("TO DO");
/*
import assert from "node:assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

// Make some test cases easier to read
const x = core.variable("x", false, core.numberType)
const a = core.variable("a", false, core.listType(core.numberType))
const return1p1 = core.returnStatement(core.binaryExpression("+", 1, 1, core.numberType))
const return2 = core.returnStatement(2)
const returnX = core.returnStatement(x)
const onePlusTwo = core.binaryExpression("+", 1, 2, core.numberType)
const identity = Object.assign(core.fun("id", core.anyType), { body: returnX })
const voidInt = core.functionType([], core.numberType)
const intFun = body => core.functionDeclaration("f", core.fun("f", voidInt), [], [body])
const callIdentity = args => core.call(identity, args)
const or = (...d) => d.reduce((x, y) => core.binaryExpression("||", x, y))
const and = (...c) => c.reduce((x, y) => core.binaryExpression("&&", x, y))
const less = (x, y) => core.binaryExpression("<", x, y)
const eq = (x, y) => core.binaryExpression("==", x, y)
const times = (x, y) => core.binaryExpressionExpression("*", x, y)
const array = (...elements) => core.listExpression(elements)
const assign = (v, e) => core.assignmentStatement(v, e)
const emptyArray = core.emptyListExpression(core.numberType)
const sub = (a, e) => core.subscript(a, e)
const program = core.program

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
  ["optimizes 0-", core.binaryExpression("-", 0, x), neg(x)],
  ["optimizes 1*", core.binaryExpression("*", 1, x), x],
  ["optimizes 1**", core.binaryExpression("**", 1, x), 1],
  ["optimizes **0", core.binaryExpression("**", x, 0), 1],
  ["removes left false from ||", or(false, less(x, 1)), less(x, 1)],
  ["removes right false from ||", or(less(x, 1), false), less(x, 1)],
  ["removes left true from &&", and(true, less(x, 1)), less(x, 1)],
  ["removes right true from &&", and(less(x, 1), true), less(x, 1)],
  ["removes x=x at beginning", program([core.assignmentStatement(x, x), xpp]), program([xpp])],
  ["removes x=x at end", program([xpp, core.assignmentStatement(x, x)]), program([xpp])],
  ["removes x=x in middle", program([xpp, assign(x, x), xpp]), program([xpp, xpp])],
  ["optimizes if-true", core.ifStatement(true, [xpp], []), [xpp]],
  ["optimizes if-false", core.ifStatement(false, [], [xpp]), [xpp]],
  ["optimizes short-if-true", core.shortIfStatement(true, [xmm]), [xmm]],
  ["optimizes short-if-false", core.shortIfStatement(false, [xpp]), []],
  ["optimizes while-false", program([core.whileStatement(false, [xpp])]), program([])],
  ["optimizes for-range", core.forRangeStatement(x, 5, "...", 3, [xpp]), []],
  ["applies if-false after folding", core.shortIfStatement(eq(1, 1), [xpp]), [xpp]],
  ["optimizes in functions", program([intFun(return1p1)]), program([intFun(return2)])],
  ["optimizes in subscripts", sub(a, onePlusTwo), sub(a, 3)],
  ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
  [
    "passes through nonoptimizable constructs",
    ...Array(2).fill([
      core.program([core.shortReturnStatement()]),
      core.variableDeclaration("x", true, "z"),
      core.assignmentStatement(x, core.binaryExpression("*", x, "z")),
      core.variableDeclaration("q", false, core.emptyArray(core.floatType)),
      core.conditional(x, 1, 2),
      core.ifStatement(x, [], []),
      core.shortIfStatement(x, []),
      core.forRangeStatement(x, 2, "..<", 5, []),
    ]),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
*/