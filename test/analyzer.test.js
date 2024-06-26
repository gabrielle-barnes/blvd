import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";

// Programs that are semantically correct
const semanticChecks = [
  [
    "function calls and variables",
    `PROLOGUE
    SCENE number addOne has number n:
    EXIT WITH n + 1--
    END SCENE
    CAST number a as addOne(3)--
    say(addOne(2))--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "variable declarations",
    `PROLOGUE
    CAST number x as 1--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "string example",
    `PROLOGUE
    CAST string person as "me"--
    say person--
    say "hello"--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "function call example",
    `PROLOGUE
    SCENE number prob has number lambda, number slope:
    EXIT WITH 1--
    END SCENE
    CAST number x as prob(5.0, 2)--
    say x--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "list indexing example",
    `PROLOGUE
    CAST string list movies as ["Get Out", "Fallen Angels", "Bones and All"]--
    say(movies[1])--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "list boolean example",
    `PROLOGUE
    CAST boolean list quiz as [true, false, true, true]--
    say(quiz[3])--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "empty list example",
    `PROLOGUE
    CAST string list empty as []--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "indexing floor example",
    `PROLOGUE
    CAST string list shows as ["Martin", "Succession", "致我们单纯的小美好"]--
    say(shows[2.9])--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "increment and decrement",
    `PROLOGUE
    CAST number x as 1--
    RECAST x as x + 1--
    RECAST x as x - 1--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "initialize with empty array",
    `PROLOGUE
    CAST number list letters as [ ]--
    END OF PROLOGUE

    ACT 1
    say 0--
    END OF ACT
    
    EPILOGUE
    say 0--
    FIN`,
  ],
  [
    "assign number array",
    `PROLOGUE
    CAST number list num as [1,2,3]--
    END OF PROLOGUE

    ACT 1
    say 0--
    END OF ACT
    
    EPILOGUE
    say 0--
    FIN`,
  ],
  [
    "assign string array ",
    `PROLOGUE
    
    END OF PROLOGUE
    
    ACT 1
    (note: list example)
    CAST string list best_movies as ["Fallen Angels", "Bones and All", "Saltburn"]--
    END OF ACT

    EPILOGUE

    FIN`,
  ],

  [
    "return",
    `PROLOGUE
    SCENE number prob has number lambda, number slope:
    EXIT WITH 1--
    END SCENE
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
  ],
  [
    "return in nested if",
    `PROLOGUE
    SCENE number prob has number lambda, number slope:
    NOMINATE true:
    EXIT WITH 0--
    END SCENE
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
  ],
  [
    "long if",
    `PROLOGUE
     CAST boolean review as true--
     NOMINATE review is true:
     say "1"--
     SUPPORTING:
     say "3"--
     END OF PROLOGUE
     
     ACT 1
     
     END OF ACT
     
     EPILOGUE
     
     FIN`,
  ],
  [
    "elseif",
    `PROLOGUE
     CAST boolean review as true--
     NOMINATE review is true:
     say "1"--
     RUNNER-UP review is true:
     say "0"--
     SUPPORTING:
     say "3"--
     END OF PROLOGUE
     
     ACT 1
     
     END OF ACT
     
     EPILOGUE
     
     FIN`,
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
    FIN`,
  ],
  [
    "conditionals with numbers",
    `PROLOGUE
    
    END OF PROLOGUE
    
    ACT 1
    NOMINATE 1 < 2:
    say 8--
    SUPPORTING:
    say 5--
    END OF ACT

    EPILOGUE
    
    FIN`,
  ],
  [
    "and operator",
    `PROLOGUE
    say (true and false)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "bit ops",
    `PROLOGUE
    say ((1 == 2) or (9 == 3))--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "simple relations",
    `PROLOGUE
    say (true and true)--
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
  ],
  [
    "relations",
    `PROLOGUE
    say ((1 <= 2) and true and (3.5<1.2))--
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
  ],
  [
    "arithmetic",
    `PROLOGUE
    CAST number x as 1--
    say (2*3+5**-3/2-5%8)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "good types for ==",
    `PROLOGUE
    say(2 == 2.0)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],

  [
    "outer variable",
    `PROLOGUE
    CAST number x as 1--
    PERFORM false:
    say x--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "assigned functions",
    `PROLOGUE
    SCENE number prob has number lambda, number slope:
    RECAST lambda as slope--
    RECAST slope as lambda--
    END SCENE
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
  ],

  [
    "good types for +",
    `PROLOGUE
    say(1 + 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],

  [
    "while",

    `PROLOGUE
    CAST number stars as 20--
    PERFORM stars >= 0:
    say stars--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
  [
    "function",

    `PROLOGUE
    SCENE string getFreeway has string fwy: 
    CAST string  fwy1 as "405"--
    EXIT WITH fwy1--
    END SCENE
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
  ],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "non-boolean in conditional",
    `PROLOGUE
    say ((1 and 2) or (9**3))--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a boolean/,
  ],
  [
    "wrong type description string",
    `PROLOGUE
    CAST string balm as 2024--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Operands do not have the same type/,
  ],
  [
    "wrong type description number",
    `PROLOGUE
    CAST number num as "dog"--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Operands do not have the same type/,
  ],
  [
    "wrong return type",
    `PROLOGUE
    
    SCENE number prob has number lambda, number slope:
    EXIT WITH "not a number"--
    END SCENE
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Cannot assign a string to a number/,
  ],
  [
    "string in conditional",
    `PROLOGUE
    say ("x" and false)--
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
    /Expected a boolean/,
  ],
  [
    "non-number increment",
    `PROLOGUE
    CAST boolean x as false--
    RECAST x as x + 1--
    END OF PROLOGUE
      
    ACT 1

    END OF ACT
      
    EPILOGUE

    FIN`,
    /Expected a number or string/,
  ],
  [
    "non-number decrement",
    `PROLOGUE
    CAST boolean x as false--
    RECAST x as x - 1--
    END OF PROLOGUE
  
    ACT 1
  
    END OF ACT
  
    EPILOGUE
  
    FIN`,
    /Expected a number/,
  ],
  [
    "undeclared id",
    `PROLOGUE
     say x--
     END OF PROLOGUE
     
     ACT 1
     
     END OF ACT
     
     EPILOGUE
     
     FIN`,
    /Identifier x not declared/,
  ],
  [
    "redeclared id",
    `PROLOGUE
    CAST number x as 1--
    CAST number x as 1--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Identifier x already declared/,
  ],
  [
    "assign bad type",
    `PROLOGUE
    CAST number x as 1--
    RECAST x as true--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Cannot assign a boolean to a number/,
  ],
  [
    "return outside function",
    `PROLOGUE
    EXIT WITH--
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
    /Return can only appear in a function/,
  ],
  [
    "non-boolean short if test",
    `PROLOGUE
    NOMINATE 1: 
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a boolean/,
  ],
  [
    "non-boolean if test",
    `PROLOGUE
    NOMINATE 1:
    say 2--
    SUPPORTING:
    say 4--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a boolean/,
  ],
  [
    "non-boolean while test",
    `PROLOGUE
    PERFORM 1: 
    END OF PROLOGUE
  
    ACT 1
  
    END OF ACT
  
    EPILOGUE
  
    FIN`,
    /Expected a boolean/,
  ],
  [
    "non-integer low range",
    `PROLOGUE
   ACTION number i in range from true, 2:
   say "hi"--
   CUT
   END OF PROLOGUE

   ACT 1

   END OF ACT

   EPILOGUE

   FIN`,
    /Expected a number/,
  ],
  [
    "non-integer high range",
    `PROLOGUE
    ACTION number i in range from 1, "six":
    say "bye"--
    CUT
    END OF PROLOGUE

    ACT 1

    END OF ACT

    EPILOGUE

    FIN`,
    /Expected a number/,
  ],
  [
    "bad types for `or`",
    `PROLOGUE
    say(false or 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a boolean/,
  ],
  [
    "bad types for `and`",
    `PROLOGUE
    say(false and 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a boolean/,
  ],
  [
    "bad types for ==",
    `PROLOGUE
    say(false == 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Operands do not have the same type/,
  ],
  [
    "bad types for !=",
    `PROLOGUE
    say(false != 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Operands do not have the same type/,
  ],
  [
    "bad types for +",
    `PROLOGUE
    say(false + 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number or string/,
  ],
  [
    "bad types for -",
    `PROLOGUE
    say(false - 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number/,
  ],
  [
    "bad types for *",
    `PROLOGUE
    say(false * 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number/,
  ],
  [
    "bad types for /",
    `PROLOGUE
    say(false / 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number/,
  ],
  [
    "bad types for /",
    `PROLOGUE
    say(false / 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number/,
  ],
  [
    "bad types for <",
    `PROLOGUE
    say(false < 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number or string/,
  ],
  [
    "bad types for <=",
    `PROLOGUE
    say(false <= 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number or string/,
  ],
  [
    "bad types for >",
    `PROLOGUE
    say(false > 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number or string/,
  ],
  [
    "bad types for >=",
    `PROLOGUE
    say(false >= 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected a number or string/,
  ],
  [
    "bad types for !=",
    `PROLOGUE
    say(false != 1)--
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /not have the same type/,
  ],
  [
    "Non-type in return type",
    `PROLOGUE
    CAST number x as 1--
    SCENE city has string fwy:
    CAST string fwy as "101"--
    END SCENE
    END OF PROLOGUE
    
    ACT 1
    
    END OF ACT
    
    EPILOGUE
    
    FIN`,
    /Expected "boolean", "number", or "string"/,
  ],
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
});
