import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
  [
    "all numeric literal forms",
    `say 8 * 89--
  `,
  ],
  ["complex expressions", "say(83 * ((((-((((13 / 21)))))))) + 1 - 0)--"],
  [
    "all unary operators",
    `say (-3)--
   say (-3)--
   `,
  ],
  [
    "all binary operators",
    `say (z * 1) / ((2 ** 3) + 4) < 5--
  `,
  ],
  [
    "all arithmetic operators",
    `MAKE int x, (2 + 4 - (-7.3)) * ((8 ** 13) / 1)--
  `,
  ],
  [
    "all relational operators",
    `MAKE int x, 1<(2<=(3==(4!=(5 >= (6>7)))))--
  `,
  ],
  [
    "end of program inside comment",
    `say (0)--
   (note: yay)`,
  ],
  [
    "comments with no text are ok",
    `say (1)--
  (note:\nprint(0))`,
  ],
  ["non-Latin letters in identifiers", "コンパイラ = 100--"],
  ["variable declaritions", "MAKE int dog , 0 --"],
  [
    "variable declaritions",
    `SCENE int arithmetic has int a, int b: 
        (note: math)
        MAKE int arit1, "message"--
        MAKE int arit2, "message"--
    END SCENE`,
  ],
  ["print statement", "say 0 --"],
  [
    "for statement",
    `ACTION int i in range from 1, 6:
                           say "i"--`,
  ],
  ["variable declaration (integer)", " MAKE int i, 1--"],
  [
    "conditionals",
    `NOMINATE review is 1:
	      say "1 Star"--
    RUNNER-UP review is 2:
	      say "2 Stars"--
    SUPPORTING:
	      say "3 or more stars"--`,
  ],
  [
    "while statement",
    `PERFORM i <= 5:
	       say "i"--
         cast i as i + 1--`,
  ],
  [
    "class declarations",
    `(note: a class example)
     STAGE Dog:
	       CONSTRUCTOR has string name, string movie, string quote:
		         Dog name, GIVEN name--
		         Dog movie, GIVEN movie--
		         Dog quote, GIVEN quote--
	       SCENE string cat has:
         say quote--
    END SCENE
    MAKE list best_movies, ["Fallen Angels", "Bones and All", "Saltburn"]--`,
  ],
];

const syntaxErrors = [
  //   ["non-letter in an identifier", "MAKE int ab😭c = 2", /Line 1, col 3/],
  //   ["malformed number", "MAKE int x = 2.", /Line 1, col 6/],
  //   ["missing semicolon(newline?)", "MAKE int x = 3 y = 1", /Line 1, col 7/],
  //   ["a missing right operand", "say (5 -", /Line 1, col 10/],
  //   ["a non-operator", "say (7 * ((2 _ 3)", /Line 1, col 15/],
  //   ["an expression starting with a )", "MAKE string x = )", /Line 1, col 5/],
  //   ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  //   ["an illegal statement on line 2", "say (5) \nx * 5;", /Line 2, col 3/],
  //   ["a statement starting with a )", "say (5) \n) * 5", /Line 2, col 1/],
  //   ["an expression starting with a *", "MAKE int x = * 71;", /Line 1, col 5/],
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
