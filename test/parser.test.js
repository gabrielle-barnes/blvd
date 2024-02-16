import assert from "node:assert/strict";
import parse from "../src/parser.js";
import { describe, it } from "mocha";

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
    "PROLOGUE\n CAST int x as ((2 + 4 - (-7.3)) * ((8 ** 13) / 1))--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "all relational operators",
    "PROLOGUE\n CAST int x as (1<(2<=(3==(4!=(5 >= (6>7))))))--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "end of program inside comment",
    "PROLOGUE\n say (0)--\n (note: yay) END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "comments with no text are ok",
    "PROLOGUE\n say (1)--\n (note: say 1--)\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "non-Latin letters in identifiers",
    "PROLOGUE\n CAST int コンパイラ as 100--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "variable declaritions",
    'PROLOGUE\n CAST string dog as "hi"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n',
  ],
  [
    "function declaritions",
    `PROLOGUE\n SCENE int arithmetic has int a, int b:\n (note: math)\n CAST int arit1 as "message"--\n CAST int arit2 as "message"--\n END SCENE\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "print statement",
    "PROLOGUE\n SCENE say 0-- END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "for statement",
    `PROLOGUE\n SCENE ACTION int i in range from 1, 6:\n say "i"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "variable declaration (integer)",
    "PROLOGUE\n CAST int i as 1--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
  ],
  [
    "conditionals",
    `PROLOGUE\n NOMINATE review is 1:\n say "1 Star"--\n RUNNER-UP review is 2:\n say "2 Stars"--\n SUPPORTING:\n say "3 or more stars"--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "while statement",
    `PROLOGUE\n PERFORM i <= 5:\n say "i"--\n CAST int i as (i + 1)--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
  ],
  [
    "class declarations",
    `(note: a class example)\n STAGE Dog:\n CONSTRUCTOR has string name, string movie, string quote:\n Dog name, GIVEN name--\n Dog movie, GIVEN movie--\n Dog quote, GIVEN quote--\n SCENE string cat has:\n say quote--\n END SCENE\n CAST list best_movies as ["Fallen Angels", "Bones and All", "Saltburn"]--\n,`,
  ],
];

const syntaxErrors = [
  [
    "non-letter in an identifier",
    `PROLOGUE\n CAST int ab😭c as 2--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 23/,
  ],
  [
    "malformed number",
    `PROLOGUE\n CAST int x as 2.--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 27/,
  ],
  [
    "missing -- and new line",
    "PROLOGUE\n CAST int x as 3 END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n",
    /Line 2, col 27/,
  ],
  [
    "a missing right operand",
    `PROLOGUE\n say (5 + --\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 20/,
  ],
  [
    "a non-operator",
    `PROLOGUE\n say (7 * (2 _ 3))--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 24/,
  ],
  [
    "an expression starting with )",
    `PROLOGUE\n CAST string x as )--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 29/,
  ],
  [
    "a statement starting with expression",
    `PROLOGUE\n x * 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 12/,
  ],
  [
    "an illegal statement on line 2",
    `PROLOGUE\n say (5)--\n x * 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 24/,
  ],
  [
    "a statement starting with a )",
    `PROLOGUE\n say (5)--\n ) * 5--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 2, col 24/,
  ],
  [
    "an expression starting with a *",
    `PROLOGUE\n CAST int x as * 71--\n END OF PROLOGUE\n\n ACT 1\n say 0--\n END OF ACT\n\n EPILOGUE\n say 0--\n FIN\n`,
    /Line 1, col 26/,
  ],
];

// for lines and columns can write the error message (missing semicolon)

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
