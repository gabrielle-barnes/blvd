import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
  [
    "all numeric literal forms",
    "PROLOGUE\n say 8 * 89--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "complex expressions",
    "PROLOGUE\n say(83 * ((((-((((13 / 21)))))))) + 1 - 0)--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "all unary operators",
    "PROLOGUE\n say (-3)--\n say (-3)--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "all binary operators",
    "PROLOGUE\n say (z * 1) / ((2 ** 3) + 4) < 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "all arithmetic operators",
    "PROLOGUE\n CAST number x as ((2 + 4 - (-7.3)) * ((8 ** 13) / 1))--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "all relational operators",
    "PROLOGUE\n CAST number x as (1<(2<=(3==(4!=(5 >= (6>7))))))--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "comments on own line",
    "PROLOGUE\n say (0)--\n (note: yay)\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "comments with no text are ok",
    "PROLOGUE\n say (1)--\n (note: say 1--)\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "non-Latin letters in identifiers",
    "PROLOGUE\n CAST number コンパイラ as 100--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "variable declaritions",
    'PROLOGUE\n CAST string dog as "hi"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n',
  ],
  [
    "function declaritions",
    `PROLOGUE\n SCENE number arithmetic has number a, number b:\n (note: math)\n CAST number arit1 as "message"--\n CAST number arit2 as "message"--\n END SCENE\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "print statement",
    `PROLOGUE\n SCENE string director has string direction:\n say "action"--\n END SCENE\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "for statement",
    `PROLOGUE\n SCENE string director has:\n ACTION number i in range from 1, 6:\n say "i"--\n CUT\n END SCENE\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "variable declaration (num)",
    "PROLOGUE\n CAST number i as 1--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "conditionals",
    `PROLOGUE\n NOMINATE review is 1:\n say "1 Star"--\n RUNNER-UP review is 2:\n say "2 Stars"--\n SUPPORTING:\n say "3 or more stars"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "while statement",
    `PROLOGUE\n PERFORM i <= 5:\n say "i"--\n CAST number i as (i + 1)--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "class declarations",
    `PROLOGUE\n STAGE Movie:\n string a--\n string b--\n EXIT STAGE\n\n END OF PROLOGUE\n\n  ACT 1\n\n END OF ACT\n\n EPILOGUE\n\n FIN\n`,
  ],
  [
    "list indexing",
    `PROLOGUE\n STAGE Movie:\n string a--\n string b--\n EXIT STAGE\n\n END OF PROLOGUE\n\n  ACT 1\n\n END OF ACT\n\n EPILOGUE\n\n FIN\n`,
  ],
];

const syntaxErrors = [
  [
    "non-letter in an identifier",
    `PROLOGUE\n CAST number ab😭c as 2--\n\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 16/,
  ],
  [
    "malformed number",
    `PROLOGUE\n CAST number x as 2.--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 21/,
  ],
  [
    "missing -- and new line",
    "PROLOGUE\n CAST number x as 3 END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
    /Line 2, col 21/,
  ],
  [
    "a missing right operand",
    `PROLOGUE\n say (5 + --\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 11/,
  ],
  [
    "a non-operator",
    `PROLOGUE\n say (7 * (2 _ 3))--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 14/,
  ],
  [
    "an expression starting with )",
    `PROLOGUE\n CAST string x as )--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 19/,
  ],
  [
    "a statement starting with expression",
    `PROLOGUE\n x * 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 2/,
  ],
  [
    "an illegal statement on line 2",
    `PROLOGUE\n say (5)--\n x * 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 3, col 2/,
  ],
  [
    "a statement starting with a )",
    `PROLOGUE\n say (5)--\n ) * 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 3, col 2/,
  ],
];

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(parse(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern);
    });
  }
});
