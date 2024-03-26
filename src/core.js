export function program(statements) {
  return { kind: "Program", statements };
}
export function block(statements) {
  return { kind: "Block", statements };
}
export function variableDeclaration(variable, initializer) {
  return { kind: "VariableDeclaration", variable, initializer };
}
export function variable(name, type) {
  return { kind: "Variable", name, type };
}
// Keywords or types

/*
export function stringType() {
    return { kind: "StringType" }
}
export function boolType() {
    return { kind: "BoolType" }
}
export function numberType() {
    return { kind: "NumberType" }
}
export function listType() {
    return { kind: "ListType" }
}
*/

export const boolType = { kind: "BoolType" };
export const numberType = { kind: "NumberType" };
export const stringType = { kind: "StringType " };

export function customType(type) {
  return { kind: "CustomType", id: type };
}
export function emptyStatement() {
  return { kind: "EmptyStatement" };
}
export function listType(baseType) {
  return { kind: "ListType", baseType };
}
export function printStatement(expression) {
  return { kind: "PrintStatement", expression };
}
export function forStatement(iterator, collection, body) {
  return { kind: "ForStatement", iterator, collection, body };
}
export function ifStatement(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate };
}
export function whileStatement(test, body) {
  return { kind: "WhileStatement", test, body };
}
export function returnStatement(expression) {
  return { kind: "ReturnStatement", expression };
}
export function assignmentStatement(target, source) {
  return { kind: "AssignmentStatement", target, source };
}
export function functionDeclaration(name, parameters, retrn, body) {
  return { kind: "FunctionDeclaration", name, parameters, retrn, body };
}
export function classDeclaration(name, fields, methods, constructor) {
  return { kind: "ClassDeclaration", name, fields, methods, constructor };
}
export function constructor(parameters, body) {
  return { kind: "Constructor", parameters, body };
}
export function memberExpression(object, id) {
  return { kind: "MemberExpression", object, id };
}
export function rangeFunction(lowerbound, upperbound) {
  return { kind: "RangeFunction", lowerbound, upperbound };
}
export function binaryExpression(left, right) {
  return { kind: "BinaryExpression", left, right };
}
export function unaryExpression(operand) {
  return { kind: "UnaryExpression", operand };
}
export function listExpression(elements) {
  return { kind: "ListExpression", elements };
}
export function subscriptExpression(array, index) {
  return { kind: "SubscriptExpression", array, index };
}
export function call(callee, args) {
  return { kind: "Call", callee, args };
}
export const standardLibrary = Object.freeze({
  number: numberType,
  boolean: boolType,
  string: stringType,
});

// We want every expression to have a type property. But we aren't creating
// special entities for numbers, strings, and booleans; instead, we are
// just using JavaScript values for those. Fortunately we can monkey patch
// the JS classes for these to give us what we want.
String.prototype.type = stringType;
Number.prototype.type = numberType;
Boolean.prototype.type = boolType;
