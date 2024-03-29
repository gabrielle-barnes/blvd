import * as core from "./core.js";

const NUMBER = core.numberType;
const STRING = core.stringType;
const BOOLEAN = core.boolType;

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
  /* !!I think we need to add a constructor related function!! */
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

  function mustHaveAClassType(e, at) {
    must(e.type?.kind === "ClassType", "Expected a class", at);
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    console.log("types", e1.type, e2.type);

    must(equivalent(e1.type, e2.type), "Operands do not have the same type", at);
  }

  function mustAllHaveSameType(expressions, at) {
    // Used to check the elements of an list expression, and the two
    // arms of a conditional expression, among other scenarios.
    must(
      expressions.slice(1).every((e) => equivalent(e.type, expressions[0].type)),
      "Not all elements have the same type",
      at
    );
  }

  function mustBeAType(e, at) {
    // This is a rather ugly hack
    must(e?.kind.endsWith("Type"), "Type expected", at);
  }

  function mustBeAListType(t, at) {
    must(t?.kind === "Listype", "Must be an array type", at);
  }

  /* TO DO */
  /* !!In our classes we have a constructor, fields? and methods. Not sure how to implement that!! */
  function includesAsField(classType, type) {
    // Whether the class type has a field of type type, directly or indirectly
    return classType.fields.some(
      (field) =>
        field.type === type ||
        (field.type?.kind === "ClassType" && includesAsField(field.type, type))
    );
  }

  function equivalent(t1, t2) {
    return (
      t1 === t2 ||
      (t1?.kind === "ListType" &&
        t2?.kind === "ListType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "FunctionType" &&
        t2?.kind === "FunctionType" &&
        equivalent(t1.returnType, t2.returnType) &&
        t1.paramTypes.length === t2.paramTypes.length &&
        t1.paramTypes.every((t, i) => equivalent(t, t2.paramTypes[i])))
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
      case "ClassType":
        return type.name;
      case "FunctionType":
        const paramTypes = type.paramTypes.map(typeDescription).join(", ");
        const returnType = typeDescription(type.returnType);
        return `(${paramTypes})->${returnType}`;
      case "ListType":
        return `[${typeDescription(type.baseType)}]`;
    }
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(e.type)} to a ${typeDescription(type)}`;
    must(assignable(e.type, type), message, at);
  }

  function mustHaveDistinctFields(type, at) {
    const fieldNames = new Set(type.fields.map((f) => f.name));
    must(fieldNames.size === type.fields.length, "Fields must be distinct", at);
  }

  function mustHaveMember(classType, field, at) {
    must(classType.fields.map((f) => f.name).includes(field), "No such field", at);
  }

  function mustBeInAFunction(at) {
    must(context.function, "Return can only appear in a function", at);
  }

  function mustBeCallable(e, at) {
    const callable = e?.kind === "ClassType" || e.type?.kind === "FunctionType";
    must(callable, "Call of non-function or non-constructor", at);
  }

  function mustNotReturnAnything(f, at) {
    must(f.type.returnType === VOID, "Something should be returned", at);
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
    Act(_act, digit, _nl_0, directions, _endAct, _nl_1, _nl_2) {
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
    ForStmt(_for, type, id, _in, range, _colon, _nl, block) {
      const iterator_type = type.rep();

      return core.forStatement(id.sourceString, range.rep(), block.rep());
    },
    IfStmt(_if, exp, _colon, _nl, block, elseifstmt, elsestmt) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      const elseifs = elseifstmt?.rep();
      const else_ = elsestmt?.rep();
      return core.IfStmt(test, consequent, elseifs, else_);
    },
    ElseIf(_elseif, exp, _colon, _nl, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return core.ElseIf(test, consequent);
    },
    Else(_else, _colon, _nl, block) {
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return core.Else(consequent);
    },
    WhileStmt(_while, exp, _colon, _nl, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;
      return core.WhileStmt(test, body);
    },
    ReturnStmt(_return, exp, _dd, _nl) {
      mustBeInAFunction({ at: _return });
      mustReturnSomething(context.function, { at: _return });
      const returnBody = exp.rep();
      mustBeReturnable(returnBody, { from: context.function }, { at: exp });
      return core.ReturnStmt(returnBody);
    },
    CastDecl(_cast, type, id, _as, exp, _dd, _nl) {
      const initializer = exp.rep();
      const variable = core.variable(id.sourceString, type.rep(), initializer.type);
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
    FuncDecl(_function, type, id, _has, params, _colon, _nl_0, block, _endfunction, _nl_1) {
      const functionDeclaration = core.functionDeclaration(id.sourceString);
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, functionDeclaration);

      context = context.newChildContext({ inLoop: false, function: functionDeclaration });
      const params_ = params.rep();
      console.log("parameters:", params_);
      functionDeclaration.paramType = params.map((p) => p.type);
      functionDeclaration.returnType = type.rep();

      const body = block.rep();
      context = context.parent;
      return core.functionDeclaration(functionDeclaration, params_, body);
    },
    ClassDecl(_class, id, _colon, _nl_0, fields, constructor, variableDeclaration, functionDeclaration, _endclass, _nl_1) {
      const type = core.classDeclaration(id.sourceString, [])
      mustNotAlreadyBeDeclared(id.sourceString, { at: id })
      context.add(id.sourceString, type)

      // fields
      type.fields = fields.children.map(field => field.rep())
      mustHaveDistinctFields(type, { at: id })
      mustNotBeSelfContaining(type, { at: id })

      // constructors 
      type.constructor = constructor.children.map(constructor => constructor.rep())
      mustHaveDistinctFields(type, { at: id })

      // variable assignment (CAST)
      type.variableDeclaration = variableDeclaration.children.map(variableDeclaration => variableDeclaration.rep())
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });

      // functions 
      type.functionDeclaration = functionDeclaration.children.map(functionDeclaration => functionDeclaration.rep())
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });

      return core.typeDeclaration(type)
    },
    Field(type, id) {
      return core.field(id.sourceString, type.rep())
    },
    Constructor(_ctor, _has, params, _colon, _nl_0, ctorbody, _endctor, _nl_1) {
      // parameters
      context = context.newChildContext({ inLoop: false, function: functionDeclaration });
      const param = params.rep();
      constructor.paramType = param.map((p) => p.type);

      // need to make new core for ctorbody? because ctorbody can only have member expressions
      // when block can have much more
      const constructor_body = ctorbody.rep()

      context = context.parent
      return core.constructor(param, constructor_body)
    },
    Params(params, _colon) {
      return params.asIteration().children.map((p) => p.rep());
    },
    Param(type, id) {
      const variable = core.variable(id.sourceString, type.rep());
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);
      return core.variableDeclaration(variable);
    },
    RangeFunc(_range, _from, exp_0, _comma, exp_1) {},

    Exp_booleanOr(exps, _or, exp) {
      let right = exp.rep();
      mustHaveBooleanType(right, { at: exp });
      for (let e of exps.rep()) {
        let left = e.rep();
        mustHaveBooleanType(left, { at: e });
        right = core.binaryExpression(left, right);
      }
      return right;
    },
    Exp1_booleanAnd(exps, _and, exp) {
      let right = exp.rep();
      mustHaveBooleanType(right, { at: exp });
      for (let e of exps.rep()) {
        let left = e.rep();
        mustHaveBooleanType(left, { at: e });
        right = core.binaryExpression(left, right);
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
    Exp3_addSub(exps, ops, exp) {
      let right = exp.rep();
      mustHaveNumericType(right, { at: exp });
      for (let e of exps.rep()) {
        let left = e.rep();
        mustBothHaveTheSameType(left, right, { at: e });
        mustHaveNumericType(left, { at: e });
        right = core.binaryExpression(left, right);
      }
      return right;
    },
    Exp4_multDivMod(exps, ops, exp) {
      let right = exp.rep();
      mustHaveNumericType(right, { at: exp });
      for (let e of exps.rep()) {
        let left = e.rep();
        mustBothHaveTheSameType(left, right, { at: e });
        mustHaveNumericType(left, { at: e });
        right = core.binaryExpression(left, right);
      }
      return right;
    },
    Exp5_exponent(exp, ops, exps) {
      let right = exp.rep();
      mustHaveNumericType(right, { at: exp });
      for (let e of exps.rep()) {
        let left = e.rep();
        mustBothHaveTheSameType(left, right, { at: e });
        mustHaveNumericType(left, { at: e });
        right = core.binaryExpression(left, right);
      }
      return right;
    },
    Exp6_parens(_open, exp, _close) {
      return exp.rep();
    },
    Exp6_listexp(_open, args, _close) {
      const elements = args.asIteration().children.map((e) => e.rep());
      mustAllHaveSameType(elements, { at: args });
      return core.listExpression(elements);
    },
    Exp6_id(id) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });

      //return core.variable(entity.name, entity.type);
      return entity;
    },

    Type(type, list) {
      //handle custom types
      console.log("type", type);
      return type === "boolean"
        ? core.boolType
        : type === "number"
        ? core.NumberType
        : type === "string"
        ? core.stringType
        : core.customType;
      //must make sure a variable exist before its used
    },
    true(_) {
      return true;
    },
    false(_) {
      return false;
    },
    number(_) {
      return core.numberType;
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
