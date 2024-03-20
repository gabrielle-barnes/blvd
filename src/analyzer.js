import * as core from "./core.js"

const INT = core.intType
// FLOAT is not used in the current version of the language
const FLOAT = core.floatType
const STRING = core.stringType
const BOOLEAN = core.boolType

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }
  add(name, entity) {
    this.locals.set(name, entity)
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name)
  }
  static root() {
    return new Context({ locals: new Map(Object.entries(core.standardLibrary)) })
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  } 
} 


export default function analyze(match) {
  /* a local variable to hold the current context */
  let context = Context.root()

  /* a bunch of semantic validation functions */
  /* !!I think we need to add a constructor related function!! */ 
  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage()
      throw new Error(`${prefix}${message}`)
    }
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(!context.lookup(name), `Identifier ${name} already declared`, at)
  }

  function mustHaveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at)
  }

  function mustHaveNumericType(e, at) {
    must([INT, FLOAT].includes(e.type), "Expected a number", at)
  }

  function mustHaveNumericOrStringType(e, at) {
    must([INT, FLOAT, STRING].includes(e.type), "Expected a number or string", at)
  }

  function mustHaveBooleanType(e, at) {
    must(e.type === BOOLEAN, "Expected a boolean", at)
  }

  function mustHaveAListType(e, at) {
    must(e.type?.kind === "ListType", "Expected an list", at)
  }

  function mustHaveAClassType(e, at) {
    must(e.type?.kind === "ClassType", "Expected a class", at)
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(equivalent(e1.type, e2.type), "Operands do not have the same type", at)
  }

  function mustAllHaveSameType(expressions, at) {
    // Used to check the elements of an list expression, and the two
    // arms of a conditional expression, among other scenarios.
    must(
      expressions.slice(1).every(e => equivalent(e.type, expressions[0].type)),
      "Not all elements have the same type",
      at
    )
  }

  function mustBeAType(e, at) {
    // This is a rather ugly hack
    must(e?.kind.endsWith("Type"), "Type expected", at)
  }

  function mustBeAListType(t, at) {
    must(t?.kind === "Listype", "Must be an array type", at)
  }

  /* TO DO */
  /* !!In our classes we have a constructor, fields? and methods. Not sure how to implement that!! */
  function includesAsField(classType, type) {
    // Whether the class type has a field of type type, directly or indirectly
    return classType.fields.some(
      field =>
        field.type === type ||
        (field.type?.kind === "ClassType" && includesAsField(field.type, type))
    )
  }

  function equivalent(t1, t2) {
    return (
      (t1?.kind === "ListType" &&
        t2?.kind === "ListType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "FunctionType" &&
        t2?.kind === "FunctionType" &&
        equivalent(t1.returnType, t2.returnType) &&
        t1.paramTypes.length === t2.paramTypes.length &&
        t1.paramTypes.every((t, i) => equivalent(t, t2.paramTypes[i])))
    )
  }

  /* !!Do we have this?!! */
  /*
  function assignable(fromType, toType) {
    return (
      toType == ANY ||
      equivalent(fromType, toType) ||
      (fromType?.kind === "FunctionType" &&
        toType?.kind === "FunctionType" &&
        // covariant in return types
        assignable(fromType.returnType, toType.returnType) &&
        fromType.paramTypes.length === toType.paramTypes.length &&
        // contravariant in parameter types
        toType.paramTypes.every((t, i) => assignable(t, fromType.paramTypes[i])))
    )
  }
  */

  /* !!Is IntType and FloatType being "num" correct?!! */
  function typeDescription(type) {
    switch (type.kind) {
      case "IntType":
        return "num"
      case "FloatType":
        return "num"
      case "StringType":
        return "string"
      case "BoolType":
        return "boolean"
      case "ClassType":
        return type.name

      /* !!We also have methods which have same aspects in functions!! */
      /* !!So do we rewrite this piece of code?!! */
      case "FunctionType":
        const paramTypes = type.paramTypes.map(typeDescription).join(", ")
        const returnType = typeDescription(type.returnType)
        return `(${paramTypes})->${returnType}`
      case "ListType":
        return `[${typeDescription(type.baseType)}]`
    }
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(e.type)} to a ${typeDescription(
      type
    )}`
    must(assignable(e.type, type), message, at)
  }

  /* !!Not sure how to do fields!! */
  function mustHaveDistinctFields(type, at) {
    const fieldNames = new Set(type.fields.map(f => f.name))
    must(fieldNames.size === type.fields.length, "Fields must be distinct", at)
  }

  function mustHaveMember(structType, field, at) {
    must(structType.fields.map(f => f.name).includes(field), "No such field", at)
  }

  function mustBeInAFunction(at) {
    must(context.function, "Return can only appear in a function", at)
  }

  function mustBeCallable(e, at) {
    const callable = e?.kind === "ClassType" || e.type?.kind === "FunctionType"
    must(callable, "Call of non-function or non-constructor", at)
  }

  function mustNotReturnAnything(f, at) {
    must(f.type.returnType === VOID, "Something should be returned", at)
  }

  function mustReturnSomething(f, at) {
    must(f.type.returnType !== VOID, "Cannot return a value from this function", at)
  }

  function mustBeReturnable(e, { from: f }, at) {
    mustBeAssignable(e, { toType: f.type.returnType }, at)
  }

  function mustHaveCorrectArgumentCount(argCount, paramCount, at) {
    const message = `${paramCount} argument(s) required but ${argCount} passed`
    must(argCount === paramCount, message, at)
  }

  /* Definitions of the semantic actions */

  // do we need to specify nl for line ending?
  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Script(prologue, acts, epilogue) {
      return core.script(prologue.rep(), acts.rep(), epilogue.rep())
    },
    Prologue(_prologue, _nl_0, directions, _endPrologue, _nl_1, _nl_2) {
      return directions.rep()
    },
    Act(_act, digit, _nl_0, directions, _endAct, _nl_1, _nl_2) {
      return directions.rep()
    },
    Epilogue(_epilogue, _nl_0, directions, _endEpilogue, _nl_1) {
      return directions.rep()
    },
    /* Direction(line){
      return line.rep()
    },
    DialogueLine(stmt){
      return stmt.rep()
    },
    CastLine(decl){
      return decl.rep()
    }, */
    PrintStmt(_print, expression, _dd, _nl) {},
    ForStmt(_for, type, id, _in, range, _colon, block) {
      return core.forStatement(id.sourceString, range.rep(), block.rep())
    },
    MemberExp_self(_given, name) {},
    MemberExp(exp) {},
    /*Program(blocks) {
      return core.program(blocks.children.map(e => e.rep()))
      //return core.script(prologue.rep(), acts.rep(), epilogue.rep())
    },
    // How do we check PROLOGUE/ACT/ EPILOGUE?
    Block(_open, statements, _close) {
      return core.block(statements.rep())
    },
    // is type.rep() ok?
    VarDecl(_cast, type, id, _as, exp, _dd, _nl) {
      const initializer = exp.rep()
      const variable = core.variable(id.sourceString, type.rep(), initializer.type)
=     mustNotAlreadyBeDeclared(id.sourceString, { at: id })
      context.add(id.sourceString, variable)
      return core.variableDeclaration(variable, initializer)
    },
    FuncDecl(_startFunc, type, id, _has, parameters, _colon, _nl, block, _endFunc) {
      const func = core.func(id.sourceString)
      mustNotAlreadyBeDeclared(id.sourceString, { at: id })
      context.add(id.sourceString, func)

      context = context.newChildContext({ inLoop: false, function: func })
      const params = parameters.rep()

      const paramTypes = params.map(p => p.type)
      const returnType = type.children[0].rep()
      func.type = core.functionType(paramTypes, returnType)

      const body = block.rep()
      
      context = context.parent
      return core.functionDeclaration(func, params, body)
    },
    ClassDecl(_class, name, _colon, fields, methods, constructor) {
      const className = name.sourceString
      mustNotAlreadyBeDeclared(className, name)
      const fieldTypes = fields.rep()
      const methodTypes = methods.rep()
      const constructorType = constructor.rep()
      context.add(className, { type: { kind: "ClassType", name: className, fields: fieldTypes, methods: methodTypes, constructor: constructorType } })
      return core.classDeclaration(className, fieldTypes, methodTypes, constructorType)
    },
    // may need to replace block with ctorbody
    Constructor(_constructor, parameters, _colon, block) {
      const constructorParameters = parameters.rep()
      context = context.newChildContext({ function: { type: { kind: "FunctionType", paramTypes: constructorParameters, returnType: VOID } } })
      const body = block.rep()
      context = context.parent
      return core.constructor(constructorParameters, body)
    },
    MemberExp_self(_given, name) {
      const fieldName = name.sourceString
      const entity = context.lookup(fieldName)
      must(entity, `Identifier ${fieldName} not declared`, name)
      return core.variable(fieldName, entity.type)
    },
    Params(_has, params, _colon) {
      return params.asIteration().children.map(e => e.rep())
    },
    Param(type, id) {
      const param = core.variable(id.sourceString, false, type.rep())
      mustNotAlreadyBeDeclared(param.name, { at: id })
      context.add(param.name, param)
      return param
    },
    // Direction
    // DialogueLine
    PrintStmt(_print, expression) {
      return core.printStatement(expression.rep())
    },
    ForStmt(_for, _open, iterator, _in, collection, _close, body) {
      return core.forStatement(iterator.sourceString, collection.rep(), body.rep())
    },
    // the following is copilot generated
    IfStmt(_if, exp, block) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      const consequent = block.rep()
      return core.ifStatement(test, consequent, null)
    },
    ElseIf(_else, _if, exp, block) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      const consequent = block.rep()
      return core.elseIfStatement(test, consequent)
    },
    ElseStmt(_else, block) {
      return core.elseStatement(block.rep())
    },
    WhileStmt(_while, exp, block) {
      const test = exp.rep()
      mustHaveBooleanType(test, { at: exp })
      context = context.newChildContext({ inLoop: true })
      const body = block.rep()
      context = context.parent
      return core.whileStatement(test, body)
    },
    ReturnStmt(returnKeyword, exp) {
      mustBeInAFunction({ at: returnKeyword })
      mustReturnSomething(context.function, { at: returnKeyword })
      const returnExpression = exp.rep()
      mustBeReturnable(returnExpression, { from: context.function }, { at: exp })
      return core.returnStatement(returnExpression)
    },
    AssignmentStmt(_recast, variable, _as, exp, _dd, _nl) {
      const target = variable.rep()
      const source = exp.rep()
      mustBeAssignable(source, { toType: target.type }, { at: variable })
      return core.assignmentStatement(target, source)
    },
    Type_id(id) {
      const type = context.lookup(id.sourceString)
      mustHaveBeenFound(type, id.sourceString, { at: id })
      mustBeAType(type, { at: id })
      return type
    },*/
    Exp_booleanOr(exps, _or, exp) {
      let right = exp.rep()
      mustHaveBooleanType(right, { at: exp })
      for (let e of exps.rep()) {
        let left = e.rep()
        mustHaveBooleanType(left, { at: e })
        right = core.binaryExpression(left, right)
      }
      return right
    },
    Exp1_booleanAnd(exps, _and, exp) {
      let right = exp.rep()
      mustHaveBooleanType(right, { at: exp })
      for (let e of exps.rep()) {
        let left = e.rep()
        mustHaveBooleanType(left, { at: e })
        right = core.binaryExpression(left, right)
      }
      return right
    },
    Exp2_relationOps(left, op, right) {
      let leftExp = left.rep()
      let rightExp = right.rep()
      mustBothHaveTheSameType(leftExp, rightExp, { at: right })
      mustHaveNumericOrStringType(leftExp, { at: left })
      mustHaveNumericOrStringType(rightExp, { at: right })
      return core.binaryExpression(leftExp, rightExp)
    },
    Exp3_addSub(exps, ops, exp) {
      let right = exp.rep()
      mustHaveNumericType(right, { at: exp })
      for (let e of exps.rep()) {
        let left = e.rep()
        mustBothHaveTheSameType(left, right, { at: e })
        mustHaveNumericType(left, { at: e })
        right = core.binaryExpression(left, right)
      }
      return right
    },
    Exp4_mulDivMod(exps, ops, exp) {
      let right = exp.rep()
      mustHaveNumericType(right, { at: exp })
      for (let e of exps.rep()) {
        let left = e.rep()
        mustBothHaveTheSameType(left, right, { at: e })
        mustHaveNumericType(left, { at: e })
        right = core.binaryExpression(left, right)
      }
      return right
    },
    Exp5_exponent(exp, ops, exps) {
      let right = exp.rep()
      mustHaveNumericType(right, { at: exp })
      for (let e of exps.rep()) {
        let left = e.rep()
        mustBothHaveTheSameType(left, right, { at: e })
        mustHaveNumericType(left, { at: e })
        right = core.binaryExpression(left, right)
      }
      return right
    },
    Exp6_parens(_open, exp, _close) {
      return exp.rep()
    },
    Exp6_listexp(_open, args, _close) {
      const elements = args.asIteration().children.map(e => e.rep())
      mustAllHaveSameType(elements, { at: args })
      return core.listExpression(elements)
    },
    true(_) {
      return true
    },
    false(_) {
      return false
    },
    message(_openQuote, _chars, _closeQuote) {
      return this.sourceString
    },
    num(_int, _dot, _decimal, _e, _sign, _pow_0, _pow_1, _pow_2) {
      return Number(this.sourceString)
    },
  })

    

  /* One line to run it */
  return builder(match).rep()
}