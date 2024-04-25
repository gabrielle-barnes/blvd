import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
  {
    name: "blank",
    source: ` PROLOGUE

      END OF PROLOGUE

      ACT 1 

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`

    `,
  },
  {
    name: "binary op",
    source: ` PROLOGUE
      CAST boolean y as 1==2--
      say y--
      END OF PROLOGUE

      ACT 1 

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
     let y_1 = false;
     console.log(y_1);
    `,
  },
  {
    name: "optimize assign",
    source: ` PROLOGUE
      CAST number x as 10--
      RECAST x as x--

      END OF PROLOGUE

      ACT 1 

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 10;
    `,
  },
  {
    name: "very small",
    source: ` PROLOGUE
      CAST number x as 10--
      RECAST x as 20--

      END OF PROLOGUE

      ACT 1 

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 10;
      x_1 = 20;
    `,
  },
  {
    name: "small",
    source: ` PROLOGUE
      CAST number x as 10--
      CAST number y as 3--
      END OF PROLOGUE

      ACT 1
      say x--
      say y--
      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 10;
      let y_2 = 3;
      console.log(x_1);
      console.log(y_2);
    `,
  },
  {
    name: "short if",
    source: ` PROLOGUE
      CAST number x as 0--
      NOMINATE (x is 0):
       say ("1")--
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0))
      {
        console.log("1");
      }
    `,
  },
  {
    name: "if then else if",
    source: ` PROLOGUE
      CAST number x as 1--
      END OF PROLOGUE

      ACT 1
      NOMINATE x is 1:
       say (1)--
      RUNNER-UP x is 2:
       say (2)--
      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 1;

      if ((x_1 === 1))
      {
        console.log(1);
      }
      else if ((x_1 === 2))
      {
        console.log(2);
      }
    `,
  },
  {
    name: "if then else",
    source: ` PROLOGUE
      CAST number x as 0--
      END OF PROLOGUE

      ACT 1
      NOMINATE (x is 0):
       say (1)--
      SUPPORTING:
       say (2)--
      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0))
      {
      console.log(1);
      }
      else
      {
      console.log(2);
      }
    `,
  },
  {
    name: "while false",
    source: `PROLOGUE
      CAST number x as 1--
      PERFORM false:
      say x--
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 1;
    `,
  },
  {
    name: "while",
    source: `PROLOGUE
      CAST number x as 1--
      PERFORM x is 1:
      RECAST x as x + 1--
      say x--
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let x_1 = 1;
      while (x_1 === 1)
      {
        x_1 = (x_1 + 1);
        console.log(x_1);
      }
    `,
  },
  {
    name: "functions",
    source: `PROLOGUE
      SCENE number f has number x, boolean y:
      EXIT WITH 0--
      END SCENE
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      function f_1(x_2, y_3)
      {
        return 0;
      }
    `,
  },
  {
    name: "function call",
    source: `PROLOGUE
      SCENE number f has number x, boolean y:
      EXIT WITH 0--
      END SCENE
      END OF PROLOGUE

      ACT 1
      say f(5, true)--
      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      function f_1(x_2, y_3)
      {
        return 0;
      }
      console.log(f_1(5, true));
    `,
  },
  {
    name: "lists",
    source: `PROLOGUE
      CAST boolean list a as [true, false, true]--
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let a_1 = [true, false, true];
    `,
  },
  {
    name: "more lists",
    source: `PROLOGUE
      CAST boolean list a as [true,false,true]--
      CAST number list b as [10,20,30]--
      CAST number list c as []--
      END OF PROLOGUE

      ACT 1
      say (a[1])--
      END OF ACT

      ACT 2
      NOMINATE (b[0] < 88):
       say false--
      SUPPORTING:
       say true--
      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      let a_1 = [true, false, true];
      let b_2 = [10, 20, 30];
      let c_3 = [];
      console.log(a_1[1]);
      if ((b_2[0] < 88))
      {
      console.log(false);
      }
      else
      {
      console.log(true);
      }
    `,
  },
  {
    name: "for loops",
    source: `PROLOGUE
      ACTION number i in range from 1, 50:
      say i--
      CUT
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      for (let i_1 = 1; i_1 < 50; i_1++)
      {
        console.log(i_1);
      }
    `,
  },
  {
    name: "for low > high",
    source: `PROLOGUE
      ACTION number i in range from 50, 1:
      say i--
      CUT
      END OF PROLOGUE

      ACT 1

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`
      
    `,
  },
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(parse(fixture.source))));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
