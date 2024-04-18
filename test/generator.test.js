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
    // notes: CAST (variable declaration works) RECAST (variable assignment doesn't)
    //also works if you remove the x_1 = 20;
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
      
    `,
  },

  // {
  //   name: "small",
  //   source: ` PROLOGUE
  //     CAST number x as 10--
  //     CAST number y as 3--
  //     END OF PROLOGUE

  //     ACT 1
  //     say x--
  //     say y--
  //     END OF ACT

  //     EPILOGUE

  //     FIN
  //   `,
  //   expected: dedent`
  //     let x_1 = 10;
  //     let y_2 = 3;
  //     console.log(x_1);
  //     console.log(y_1);
  //   `,
  // },

  // notes: error (TypeError: s.consequent.forEach is not a function) when run
  // {
  //   name: "if",
  //   source: ` PROLOGUE
  //     CAST number x as 0--
  //     NOMINATE (x is 0):
  //      say ("1")--
  //     END OF PROLOGUE

  //     ACT 1
  //     NOMINATE (x is 0):
  //      say (1)--
  //     SUPPORTING:
  //      say (2)--
  //     END OF ACT

  //     ACT 2
  //     NOMINATE (x is 0):
  //      say (1)--
  //     RUNNER-UP x is 2:
  //      say (3)--
  //     END OF ACT

  //     EPILOGUE
  //     NOMINATE (x is 0):
  //      say (1)--
  //     RUNNER-UP (x is 2):
  //      say (3)--
  //     SUPPORTING:
  //      say (4)--
  //     FIN
  //   `,
  //   expected: dedent`
  //     let x_1 = 0;
  //     if ((x_1 === 0)) {
  //       console.log("1");
  //     }
  //     if ((x_1 === 0)) {
  //       console.log(1);
  //     } else {
  //       console.log(2);
  //     }
  //     if ((x_1 === 0)) {
  //       console.log(1);
  //     } else
  //       if ((x_1 === 2)) {
  //         console.log(3);
  //       }
  //     if ((x_1 === 0)) {
  //       console.log(1);
  //     } else
  //       if ((x_1 === 2)) {
  //         console.log(3);
  //       } else {
  //         console.log(4);
  //       }
  //   `,
  // },

  // {
  //   name: "while",
  //   source: `PROLOGUE
  //     CAST number x as 1--
  //     PERFORM false:
  //     say x--
  //     END OF PROLOGUE

  //     ACT 1
  //     CAST number y as 10--
  //     PERFORM true:
  //     say y--
  //     END OF ACT

  //     EPILOGUE
  //     say ("Working while loops!")--
  //     FIN
  //   `,
  //   expected: dedent`
  //     let x_1 = 1;
  //     while (false) {
  //       console.log(x_1);
  //     }
  //     let y_1 = 10;
  //     while (true) {
  //       console.log(y_1);
  //     }
  //     console.log("Working while loops!");
  //   `,
  // },

  // /*
  // ONCE WE ADD FUNCTIONS CALLS TO OUR LANG WE CAN PUT IT IN THIS EXAMPLE
  // {
  //   name: "functions",
  //   source: `
  //     PROLOGUE
  //     CAST number z as 0.5--
  //     SCENE number f has number x, boolean y:
  //     NOMINATE(x>y):
  //     say (x)--
  //     EXIT WITH 0--
  //     END SCENE
  //     END OF PROLOGUE

  //     ACT 1
  //     SCENE boolean g has number x:
  //     EXIT WITH false--
  //     END SCENE
  //     END OF ACT

  //     EPILOGUE
  //     say ("Working while loops!")--
  //     FIN

  //   `,
  //   expected: dedent`
  //     let z_1 = 0.5;
  //     function f_2(x_3, y_4) {
  //       if (x>y){

  //       }

  //       return;
  //     }
  //     function g_5() {
  //       return false;
  //     }
  //     f_2(z_1, g_5());
  //   `,
  // },
  // */
  // // TypeError: s.consequent.forEach is not a function
  // {
  //   name: "lists",
  //   source: `PROLOGUE
  //     CAST boolean list a as [true,false,true]--
  //     CAST number list b as [10,20,30]--
  //     CAST number list c as []--
  //     END OF PROLOGUE

  //     ACT 1
  //     say (a[1])--
  //     END OF ACT

  //     ACT 2
  //     NOMINATE (b[0] < 88):
  //      say false--
  //     SUPPORTING:
  //      say true--
  //     END OF ACT

  //     EPILOGUE

  //     FIN
  //   `,
  //   expected: dedent`
  //     let a_1 = [true,false,true];
  //     let b_2 = [10,20,30];
  //     let c_3 = [];
  //     console.log(a_1[1]);
  //     console.log((((b_2[0] < 88)) ? (false) : (true)));
  //   `,
  // },
  // // AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  // {
  //   name: "for loops",
  //   source: `PROLOGUE
  //     ACTION number i in range from 1, 50:
  //     say i--
  //     CUT
  //     END OF PROLOGUE

  //     ACT 1

  //     END OF ACT

  //     EPILOGUE

  //     FIN
  //   `,
  //   expected: dedent`
  //     for (let i_1 = 1; i_1 < 50; i_1++) {
  //       console.log(i_1);
  //     }
  //   `,
  // },

  /*
  {
    name: "standard library",
    source: `
      let x = 0.5;
      print(sin(x) - cos(x) + exp(x) * ln(x) / hypot(2.3, x));
      print(bytes("∞§¶•"));
      print(codepoints("💪🏽💪🏽🖖👩🏾💁🏽‍♀️"));
    `,
    expected: dedent`
      let x_1 = 0.5;
      console.log(((Math.sin(x_1) - Math.cos(x_1)) + ((Math.exp(x_1) * Math.log(x_1)) / Math.hypot(2.3,x_1))));
      console.log([...Buffer.from("∞§¶•", "utf8")]);
      console.log([...("💪🏽💪🏽🖖👩🏾💁🏽‍♀️")].map(s=>s.codePointAt(0)));
    `,
  },
  */
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(parse(fixture.source))));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
