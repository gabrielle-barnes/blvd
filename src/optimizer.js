import * as core from "./core.js";

export default function optimize(node) {
  return optimizers?.[node.kind]?.(node) ?? node;
}

const optimizers = {
  Program(p) {
    p.statements = p.statements.flatMap(optimize);
    return p;
  },
  VariableDeclaration(d) {
    d.variable = optimize(d.variable);
    d.initializer = optimize(d.initializer);
    return d;
  },
  FunctionDeclaration(d) {
    d.fun = optimize(d.fun);
    if (d.body) d.body = d.body.flatMap(optimize);
    return d;
  },
  AssignmentStatement(s) {
    s.source = optimize(s.source);
    s.target = optimize(s.target);
    if (s.source === s.target) {
      return [];
    }
    return s;
  },
  PrintStatement(p) {
    p.expression = optimize(p.expression);
    return p;
  },
  ReturnStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },
  IfStatement(s) {
    s.consequent = s.consequent.statements.flatMap(optimize);
    s.alternates = s.alternates.flatMap(optimize);
    s.tail = s.tail.flatMap(optimize);
    return s;
    // if (s.alternate?.kind?.endsWith?.("IfStatement")) {
    //   s.alternates = optimize(s.alternate);
    // } else {
    //   s.alternates = s.alternates.flatMap(optimize);
    // }
    // if (s.test.constructor === Boolean) {
    //   return s.test ? s.consequent : s.alternate;
    // }
    // return s;
  },
  ShortIfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = s.consequent.flatMap(optimize);
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : [];
    }
    return s;
  },
  WhileStatement(s) {
    s.test = optimize(s.test);
    if (s.test === false) {
      // while false is a no-op
      return [];
    }
    s.body = s.body.flatMap(optimize);
    return s;
  },
  ForRangeStatement(s) {
    s.iterator = optimize(s.iterator);
    s.low = optimize(s.low);
    s.op = optimize(s.op);
    s.high = optimize(s.high);
    s.body = s.body.flatMap(optimize);
    if (s.low.constructor === Number) {
      if (s.high.constructor === Number) {
        if (s.low > s.high) {
          return [];
        }
      }
    }
    return s;
  },
  BinaryExpression(e) {
    e.op = optimize(e.op);
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.op === "and") {
      // Optimize boolean constants in && and ||
      if (e.left === true) return e.right;
      else if (e.right === true) return e.left;
    } else if (e.op === "or") {
      if (e.left === false) return e.right;
      else if (e.right === false) return e.left;
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right;
        else if (e.op === "-") return e.left - e.right;
        else if (e.op === "*") return e.left * e.right;
        else if (e.op === "/") return e.left / e.right;
        else if (e.op === "**") return e.left ** e.right;
        else if (e.op === "<") return e.left < e.right;
        else if (e.op === "<=") return e.left <= e.right;
        else if (e.op === "==") return e.left === e.right;
        else if (e.op === "!=") return e.left !== e.right;
        else if (e.op === ">=") return e.left >= e.right;
        else if (e.op === ">") return e.left > e.right;
      } else if (e.left === 0 && e.op === "+") return e.right;
      else if (e.left === 1 && e.op === "*") return e.right;
      else if (e.left === 1 && e.op === "**") return 1;
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0;
    } else if ([Number, BigInt].includes(e.right.constructor)) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
      else if (e.op === "*" && e.right === 0) return 0;
      else if (e.op === "**" && e.right === 0) return 1;
    }
    return e;
  },
  Subscript(e) {
    e.list = optimize(e.list);
    e.index = optimize(e.index);
    return e;
  },
  ListExpression(e) {
    e.elements = e.elements.map(optimize);
    return e;
  },
  Call(c) {
    c.callee = optimize(c.callee);
    c.args = c.args.map(optimize);
    return c;
  },
};
