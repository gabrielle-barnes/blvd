import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
/* import {
  program,
  variableDeclaration,
  variable,
  binaryExpression,
  floatType,
} from "../src/core.js"; */

// Programs that are semantically correct
const semanticChecks = [
  [
    "variable declarations",
    `PROLOGUE\nCAST number x as 1--\nEND OF PROLOGUE\n\nACT 1\n\nEND OF ACT\n\nEPILOGUE\n\nFIN\n`,
  ],
  [
    "increment and decrement",
    `PROLOGUE\nCAST number x as 1--\nRECAST x as x + 1--\nRECAST x as x - 1--\nEND OF PROLOGUE\n\nACT 1\n\nEND OF ACT\n\nEPILOGUE\n\nFIN\n`,
  ],

  [
    "long if",
    `PROLOGUE\n CAST boolean review as true--\n NOMINATE review is true:\n say "1"--\n SUPPORTING:\n say "3"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "elsif",
    `PROLOGUE\n CAST boolean review as true--\n NOMINATE review is true:\n say "1"--\n RUNNER-UP review is true:\n say "0"--\n SUPPORTING:\n say "3"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "for in range",
    `PROLOGUE
    
    END OF PROLOGUE
    
    ACT 1
    ACTION number i in range from 1, 6:
      say i--
    CUT
    END OF ACT
    
    EPILOGUE
      say 0--
    FIN
  `,
  ],
  [
    "conditionals with numbers",
    `PROLOGUE\n\n END OF PROLOGUE\n\n ACT 1\n NOMINATE 1 < 2:\n say 8--\n SUPPORTING:\n say 5--\n END OF ACT\n\n EPILOGUE\n\n FIN\n`,
  ],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  /*  ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  ["non-int increment", "let x=false;x++;", /an integer/],
  ["non-int decrement", 'let x=some[""];x++;', /an integer/],
  ["undeclared id", "print(x);", /Identifier x not declared/],
  ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  ["recursive struct", "struct S { x: int y: S }", /must not be self-containing/],
  ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant/],
  ["assign bad type", "let x=1;x=true;", /Cannot assign a boolean to a int/],
  ["assign bad array type", "let x=1;x=[true];", /Cannot assign a \[boolean\] to a int/],
  ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while true {function f() {break;}}",
    /Break can only appear in a loop/,
  ],
  ["return outside function", "return;", /Return can only appear in a function/],
  ["return value from void function", "function f() {return 1;}", /Cannot return a value/],
  ["return nothing from non-void", "function f(): int {return;}", /should be returned/],
  ["return type mismatch", "function f(): int {return false;}", /boolean to a int/],
  ["non-boolean short if test", "if 1 {}", /Expected a boolean/],
  ["non-boolean if test", "if 1 {} else {}", /Expected a boolean/],
  ["non-boolean while test", "while 1 {}", /Expected a boolean/],
  ["non-integer repeat", 'repeat "1" {}', /Expected an integer/],
  ["non-integer low range", "for i in true...2 {}", /Expected an integer/],
  ["non-integer high range", "for i in 1..<no int {}", /Expected an integer/],
  ["non-array in for", "for i in 100 {}", /Expected an array/],
  ["non-boolean conditional test", "print(1?2:3);", /Expected a boolean/],
  ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
  ["unwrap non-optional", "print(1??2);", /Expected an optional/],
  ["bad types for ||", "print(false||1);", /Expected a boolean/],
  ["bad types for &&", "print(false&&1);", /Expected a boolean/],
  ["bad types for ==", "print(false==1);", /Operands do not have the same type/],
  ["bad types for !=", "print(false==1);", /Operands do not have the same type/],
  ["bad types for +", "print(false+1);", /Expected a number or string/],
  ["bad types for -", "print(false-1);", /Expected a number/],
  ["bad types for *", "print(false*1);", /Expected a number/],
  ["bad types for /", "print(false/1);", /Expected a number/],
  ["bad types for **", "print(false**1);", /Expected a number/],
  ["bad types for <", "print(false<1);", /Expected a number or string/],
  ["bad types for <=", "print(false<=1);", /Expected a number or string/],
  ["bad types for >", "print(false>1);", /Expected a number or string/],
  ["bad types for >=", "print(false>=1);", /Expected a number or string/],
  ["bad types for ==", "print(2==2.0);", /not have the same type/],
  ["bad types for !=", "print(false!=1);", /not have the same type/],
  ["bad types for negation", "print(-true);", /Expected a number/],
  ["bad types for length", "print(#false);", /Expected an array/],
  ["bad types for not", 'print(!"hello");', /Expected a boolean/],
  ["bad types for random", "print(random 3);", /Expected an array/],
  ["non-integer index", "let a=[1];print(a[false]);", /Expected an integer/],
  ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
  ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  ["Too many args", "function f(x: int) {}\nf(1,2);", /1 argument\(s\) required but 2 passed/],
  ["Too few args", "function f(x: int) {}\nf();", /1 argument\(s\) required but 0 passed/],
  [
    "Parameter type mismatch",
    "function f(x: int) {}\nf(false);",
    /Cannot assign a boolean to a int/,
  ],
  [
    "function type mismatch",
    `function f(x: int, y: (boolean)->void): int { return 1; }
     function g(z: boolean): int { return 5; }
     f(2, g);`,
    /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  ],
  ["bad param type in fn assign", "function f(x: int) {} function g(y: float) {} f = g;"],
  [
    "bad return type in fn assign",
    'function f(x: int): int {return 1;} function g(y: int): string {return "uh-oh";} f = g;',
    /Cannot assign a \(int\)->string to a \(int\)->int/,
  ], */
  // Syntax error
  // [
  //   "Non-type in return type",
  //   'PROLOGUE\nCAST number x as 1--\nSCENE non-type f has string fwy:\nCAST string fwy as "101"--\nEND SCENE\nEND OF PROLOGUE\n\nACT 1\n\nEND OF ACT\n\nEPILOGUE\n\nFIN\n',
  //   /Type expected/,
  // ],
  // This is actually a syntax error
  // [
  //   "Non-type in field type",
  //   "PROLOGUE\nCAST number x as 1--\nCAST non-type y as 2--\nEND OF PROLOGUE\n\nACT 1\n\nEND OF ACT\n\nEPILOGUE\n\nFIN\n",
  //   /Type expected/,
  // ],
];

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
  /* it("produces the expected representation for a trivial program", () => {
    assert.deepEqual(
      analyze(parse("let x = π + 2.2;")),
      program([
        variableDeclaration(
          variable("x", false, floatType),
          binaryExpression("+", variable("π", true, floatType), 2.2, floatType)
        ),
      ])
    );
  }); */
});
