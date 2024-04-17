import assert from "node:assert/strict"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "blank",
    source: 
    ` PROLOGUE

      END OF PROLOGUE

      ACT 1 

      END OF ACT

      EPILOGUE

      FIN
    `,
    expected: dedent`

    `,
  },
  /*
  {
    // notes: CAST (variable declaration works) RECAST (variable assignment doesn't)
    name: "very small",
    source: 
    ` PROLOGUE
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
  */

  /*
  {
    name: "small",
    source: 
    ` PROLOGUE
      CAST number x as 10--
      CAST number y as 2--
      END OF PROLOGUE

      ACT 1 
      RECAST x as 20--
      RECAST y as y ** 2--
      END OF ACT

      EPILOGUE
      say x--
      say y--
      FIN
    `,
    expected: dedent`
      let x_1 = 10;
      let y_2 = 2;

      x_1 = 20;
      y_2 = y_1 ** 2;
      
      console.log(x_1);
      console.log(y_2);
    `,
  },
  */

  /*
    // notes: error (TypeError: s.consequent.forEach is not a function) when run
    {
    name: "if",
    source: 
    ` PROLOGUE
      CAST number x as 0--
      NOMINATE (x is 0):
       say ("1")--
      END OF PROLOGUE 

      ACT 1
      NOMINATE (x is 0):
       say (1)-- 
      SUPPORTING: 
       say (2)-- 
      END OF ACT

      ACT 2
      NOMINATE (x is 0): 
       say (1)-- 
      RUNNER-UP x is 2: 
       say (3)--
      END OF ACT

      EPILOGUE
      NOMINATE (x is 0): 
       say (1)-- 
      RUNNER-UP (x is 2): 
       say (3)-- 
      SUPPORTING: 
       say (4)--
      FIN
    `,
    expected: dedent`
      let x_1 = 0;
      if ((x_1 === 0)) {
        console.log("1");
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else {
        console.log(2);
      }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        }
      if ((x_1 === 0)) {
        console.log(1);
      } else
        if ((x_1 === 2)) {
          console.log(3);
        } else {
          console.log(4);
        }
    `,
  },
  */

  /*
  {
    name: "while",
    source:
    ` PROLOGUE
      CAST number x as 1--
      PERFORM false:
      say x--
      END OF PROLOGUE

      ACT 1
      CAST number y as 10--
      PERFORM true:
      say y-- 
      END OF ACT

      EPILOGUE
      say ("Working while loops!")--
      FIN
    `,
    expected: dedent`
      let x_1 = 1;
      while (false) {
        console.log(x_1);
      }
      let y_1 = 10;
      while (true) {
        console.log(y_1);
      }
      console.log("Working while loops!");
    `,
  },
  */

  /*
  {
    name: "functions",
    source: `
      
    `,
    expected: dedent`
      let z_1 = 0.5;
      function f_2(x_3, y_4) {
        console.log((Math.sin(x_3) > Math.PI));
        return;
      }
      function g_5() {
        return false;
      }
      f_2(z_1, g_5());
    `,
  },
  */
   
  /*
  {
    name: "arrays",
    source: `
      let a = [true, false, true];
      let b = [10, #a - 20, 30];
      const c = [[int]]();
      const d = random b;
      print(a[1] || (b[0] < 88 ? false : true));
    `,
    expected: dedent`
      let a_1 = [true,false,true];
      let b_2 = [10,(a_1.length - 20),30];
      let c_3 = [];
      let d_4 = ((a=>a[~~(Math.random()*a.length)])(b_2));
      console.log((a_1[1] || (((b_2[0] < 88)) ? (false) : (true))));
    `,
  },
  */

  /*
  {
    name: "structs",
    source: `
      struct S { x: int }
      let x = S(3);
      print(x.x);
    `,
    expected: dedent`
      class S_1 {
      constructor(x_2) {
      this["x_2"] = x_2;
      }
      }
      let x_3 = new S_1(3);
      console.log((x_3["x_2"]));
    `,
  },
  */

  /*
  {
    name: "optionals",
    source: `
      let x = no int;
      let y = x ?? 2;
      struct S {x: int}
      let z = some S(1);
      let w = z?.x;
    `,
    expected: dedent`
      let x_1 = undefined;
      let y_2 = (x_1 ?? 2);
      class S_3 {
      constructor(x_4) {
      this["x_4"] = x_4;
      }
      }
      let z_5 = new S_3(1);
      let w_6 = (z_5?.["x_4"]);
    `,
  },
  */

  /*
  {
    name: "for loops",
    source: `
      for i in 1..<50 {
        print(i);
      }
      for j in [10, 20, 30] {
        print(j);
      }
      repeat 3 {
        // hello
      }
      for k in 1...10 {
      }
    `,
    expected: dedent`
      for (let i_1 = 1; i_1 < 50; i_1++) {
        console.log(i_1);
      }
      for (let j_2 of [10,20,30]) {
        console.log(j_2);
      }
      for (let i_3 = 0; i_3 < 3; i_3++) {
      }
      for (let k_4 = 1; k_4 <= 10; k_4++) {
      }
    `,
  },
  */

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
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(optimize(analyze(parse(fixture.source))))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})