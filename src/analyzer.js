import * as core from "./core.js";

const NUMBER = core.numberType;
const STRING = core.stringType;
const BOOLEAN = core.boolType;
const VOID = core.voidType;

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }
  add(name, entity) {
    this.locals.set(name, entity);
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }
  static root() {
    return new Context({ locals: new Map(Object.entries(core.standardLibrary)) });
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() });
  }
}

export default function analyze(match) {
  /* a local variable to hold the current context */
  let context = Context.root();

  /* a bunch of semantic validation functions */
  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage();
      throw new Error(`${prefix}${message}`);
    }
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(!context.lookup(name), `Identifier ${name} already declared`, at);
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at);
  }

  function mustHaveNumericType(e, at) {
    must([NUMBER].includes(e.type), "Expected a number", at);
  }

  function mustHaveNumericOrStringType(e, at) {
    must([NUMBER, STRING].includes(e.type), "Expected a number or string", at);
  }

  function mustHaveBooleanType(e, at) {
    must(e.type === BOOLEAN, "Expected a boolean", at);
  }

  function mustHaveAListType(e, at) {
    must(e.type?.kind === "ListType", "Expected an list", at);
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(equivalent(e1.type, e2.type), "Operands do not have the same type", at);
  }

  function mustAllHaveSameType(expressions, at) {
    must(
      expressions.slice(1).every((e) => equivalent(e.type, expressions[0].type)),
      "Not all elements have the same type",
      at
    );
  }

  function assignable(fromType, toType) {
    return equivalent(fromType, toType);
  }

  function equivalent(t1, t2) {
    return (
      t1 === t2 ||
      (t1?.kind === "ListType" &&
        t2?.kind === "ListType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "EmptyListType" && t2?.kind === "ListType")
    );
  }

  function typeDescription(type) {
    switch (type.kind) {
      case "NumberType":
        return "number";
      case "StringType":
        return "string";
      case "BoolType":
        return "boolean";
    }
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(e.type)} to a ${typeDescription(type)}`;
    must(assignable(e.type, type), message, at);
  }

  function mustBeInAFunction(at) {
    must(context.function, "Return can only appear in a function", at);
  }

  function mustBeCallable(e, at) {
    const callable = e?.kind === "ClassType" || e.type?.kind === "FunctionType";
    must(callable, "Call of non-function or non-constructor", at);
  }

  function mustReturnSomething(f, at) {
    must(f.type.returnType !== VOID, "Cannot return a value from this function", at);
  }

  function mustBeReturnable(e, { from: f }, at) {
    mustBeAssignable(e, { toType: f.type.returnType }, at);
  }

  function mustHaveCorrectArgumentCount(argCount, paramCount, at) {
    const message = `${paramCount} argument(s) required but ${argCount} passed`;
    must(argCount === paramCount, message, at);
  }

  /* Definitions of the semantic actions */
  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Script(prologue, acts, epilogue) {
      const statements = [];
      for (let statement of prologue.rep()) statements.push(statement);
      for (let act of acts.children) {
        for (let statement of act.rep()) statements.push(statement);
      }
      for (let statement of epilogue.rep()) statements.push(statement);
      return core.program(statements);
    },
    Prologue(_prologue, _nl_0, directions, _endPrologue, _nl_1, _nl_2) {
      return directions.children.map((d) => d.rep());
    },
    Act(_act, _digit, _nl_0, directions, _endAct, _nl_1, _nl_2) {
      return directions.children.map((d) => d.rep());
    },
    Epilogue(_epilogue, _nl_0, directions, _endEpilogue, _nl_1) {
      return directions.children.map((d) => d.rep());
    },
    Direction_freeze(_nl) {
      return core.emptyStatement();
    },
    DialogueLine(stmt) {
      return stmt.rep();
    },
    CastLine(decl) {
      return decl.rep();
    },
    PrintStmt(_print, expression, _dd, _nl) {
      return core.printStatement(expression.rep());
    },
    ForStmt(
      _for,
      type,
      id,
      _in,
      _range,
      _from,
      exp1,
      _comma,
      exp2,
      _colon,
      _nl1,
      block,
      _cut,
      _nl2
    ) {
      const [low, high] = [exp1.rep(), exp2.rep()];
      mustHaveNumericType(low, { at: exp1 });
      mustHaveNumericType(high, { at: exp2 });
      const iterator = core.variable(id.sourceString, NUMBER);
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context = context.newChildContext({ inLoop: true });
      context.add(id.sourceString, iterator);
      const body = block.rep();
      context = context.parent;
      return core.forStatement(iterator, low, high, body);
    },
    IfStmt(_if, exp, _colon, _nl, block, elseifstmt, elsestmt) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      const elseifs = elseifstmt?.children.map((e) => e.rep());
      const else_ = elsestmt?.children.map((e) => e.rep());
      return core.ifStatement(test, consequent, elseifs, else_);
    },
    ElseIf(_elseif, exp, _colon, _nl, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return core.elseIfStatement(test, consequent);
    },
    Else(_else, _colon, _nl, block) {
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return core.elseStatement(consequent);
    },
    WhileStmt(_while, exp, _colon, _nl, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;
      return core.whileStatement(test, body);
    },
    Block(directions) {
      return core.block(directions.children.map((d) => d.rep()));
    },
    ReturnStmt(returnKeyword, exp, _dd, _nl) {
      mustBeInAFunction({ at: returnKeyword });
      mustReturnSomething(context.function, { at: returnKeyword });
      const returnBody = exp.rep();
      mustBeReturnable(returnBody, { from: context.function }, { at: exp });
      return core.returnStatement(returnBody);
    },
    CastDecl(_cast, type, id, _as, exp, _dd, _nl) {
      const initializer = exp.rep();
      const variable = core.variable(id.sourceString, type.rep());
      mustBothHaveTheSameType(initializer, variable, { at: id });
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);
      return core.variableDeclaration(variable, initializer);
    },
    RecastDecl(_recast, id, _as, exp, _dd, _nl) {
      const source = exp.rep();
      const target = id.rep();
      mustBeAssignable(source, { toType: target.type }, { at: id });
      return core.assignmentStatement(target, source);
    },
    /*
      FunctionDeclarations also hold our Functions.
      Currently, we access function type, id, and parameters through our FuncDecl
      but we should have created a Function object in the FuncDecl.
    }
    */
    FuncDecl(_nl_0, _function, type, id, _has, params, _colon, _nl_1, block, _endfunction, _nl_2) {
      const functionDeclaration = core.functionDeclaration(id.sourceString);
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, functionDeclaration);

      context = context.newChildContext({ inLoop: false, function: functionDeclaration });
      functionDeclaration.parameters = params.rep();
      const paramTypes = functionDeclaration.parameters.map((p) => p.type);
      const returnType = type.rep();
      functionDeclaration.type = core.functionType(paramTypes, returnType);

      const body = block.rep();
      context = context.parent;
      functionDeclaration.body = body;
      functionDeclaration.returnType = returnType;
      return functionDeclaration;
    },
    Params(params, _colon) {
      return params.asIteration().children.map((p) => p.rep());
    },
    Param(type, id) {
      const variable = core.variable(id.sourceString, type.rep());
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);
      return variable;
    },
    Exp_booleanOr(exp1, _or, exp2) {
      let right = exp2.rep();
      mustHaveBooleanType(right, { at: exp2 });
      for (let e of exp1.children) {
        let left = e.rep();
        mustHaveBooleanType(left, { at: e });
        right = core.binaryExpression("or", left, right, BOOLEAN);
      }
      return right;
    },
    Exp1_booleanAnd(exp1, _and, exp2) {
      let right = exp2.rep();
      mustHaveBooleanType(right, { at: exp2 });
      for (let e of exp1.children) {
        let left = e.rep();
        mustHaveBooleanType(left, { at: e });
        right = core.binaryExpression("and", left, right, BOOLEAN);
      }
      return right;
    },
    Exp2_relationOps(left, relop, right) {
      let leftExp = left.rep();
      let op = relop.sourceString;
      let rightExp = right.rep();
      if (["<", "<=", ">", ">="].includes(op)) {
        mustHaveNumericOrStringType(leftExp, { at: left });
      }
      mustBothHaveTheSameType(leftExp, rightExp, { at: relop });
      return core.binaryExpression(op, leftExp, rightExp, BOOLEAN);
    },
    Exp3_addSub(exp1, ops, exp2) {
      const [left, op, right] = [exp1.rep(), ops.sourceString, exp2.rep()];
      if (op === "+") {
        mustHaveNumericOrStringType(left, { at: exp1 });
      } else {
        mustHaveNumericType(left, { at: exp1 });
      }
      mustBothHaveTheSameType(left, right, { at: ops });
      return core.binaryExpression(op, left, right, left.type);
    },
    Exp4_multDivMod(exp1, ops, exp2) {
      const [left, op, right] = [exp1.rep(), ops.sourceString, exp2.rep()];
      mustHaveNumericType(left, { at: exp1 });
      mustBothHaveTheSameType(left, right, { at: ops });
      return core.binaryExpression(op, left, right, left.type);
    },
    Exp5_exponent(exp2, ops, exp1) {
      const [left, op, right] = [exp1.rep(), ops.sourceString, exp2.rep()];
      mustHaveNumericType(left, { at: exp1 });
      mustBothHaveTheSameType(left, right, { at: ops });
      return core.binaryExpression(op, left, right, left.type);
    },
    Exp6_parens(_open, exp2, _close) {
      return exp2.rep();
    },
    Exp6_emptylist(_open, _close) {
      return core.emptyListExpression(core.emptyListType());
    },
    Exp6_listexp(_open, args, _close) {
      const elements = args.asIteration().children.map((e) => e.rep());
      mustAllHaveSameType(elements, { at: args });
      let list = core.listExpression(elements);
      list.type = core.listType(elements[0]?.type);
      return list;
    },
    Exp6_call(exp, open, expList, _close) {
      const callee = exp.rep();
      mustBeCallable(callee, { at: exp });
      const targetTypes = callee.type.paramTypes;
      const exps = expList.asIteration().children;
      mustHaveCorrectArgumentCount(exps.length, targetTypes.length, { at: open });
      const args = exps.map((exp, i) => {
        const arg = exp.rep();
        mustBeAssignable(arg, { toType: targetTypes[i] }, { at: exp });
        return arg;
      });
      return core.call(callee, args);
    },
    Exp6_subscript(exp1, _open, exp2, _close) {
      const [list, subscript] = [context.lookup(exp1.rep()), Math.floor(exp2.rep())];
      mustHaveAListType(list, { at: exp1 });
      mustHaveNumericType(subscript, { at: exp2 });
      return core.subscript(list, subscript);
    },
    Exp6_id(id) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      return entity;
    },

    Type_list(type, _list) {
      const baseType =
        type.sourceString === "boolean"
          ? BOOLEAN
          : type.sourceString === "number"
          ? NUMBER
          : STRING;
      return core.listType(baseType);
    },
    Type_base(type) {
      const baseType =
        type.sourceString === "boolean"
          ? BOOLEAN
          : type.sourceString === "number"
          ? NUMBER
          : STRING;
      return baseType;
    },
    id(_first, _rest) {
      return this.sourceString;
    },
    true(_) {
      return true;
    },
    false(_) {
      return false;
    },
    message(_openQuote, _chars, _closeQuote) {
      return this.sourceString;
    },
    num(_int, _dot, _decimal, _e, _sign, _pow_0, _pow_1, _pow_2) {
      return Number(this.sourceString);
    },
  });

  /* One line to run it */
  return builder(match).rep();
}
