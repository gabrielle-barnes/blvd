import * as core from "./core.js"

const INT = core.intType
const FLOAT = core.floatType
const STRING = core.stringType
const BOOLEAN = core.boolType

class Context {

  /*constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
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
  */

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

  /* const builder = match.matcher.grammar.createSemantics().addOperation("rep") 
    Program(statements) {
      return core.program(statements.children.map(s => s.rep()))
    },
  */

    

  /* One line to run it */
  return builder(match).rep()
}