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

export const boolType = { kind: "BoolType" };
export const numberType = { kind: "NumberType" };
export const stringType = { kind: "StringType" };

export function emptyStatement() {
  return { kind: "EmptyStatement" };
}
export function listType(baseType) {
  return { kind: "ListType", baseType };
}
export function emptyListType() {
  return { kind: "EmptyListType" };
}
export function functionType(paramTypes, returnType) {
  return { kind: "FunctionType", paramTypes, returnType };
}
export function printStatement(expression) {
  return { kind: "PrintStatement", expression };
}
export function forStatement(iterator, low, high, body) {
  return { kind: "ForStatement", iterator, low, high, body };
}
export function ifStatement(test, consequent, alternates, tail) {
  return { kind: "IfStatement", test, consequent, alternates, tail };
}
export function elseIfStatement(test, consequent) {
  return { kind: "ElseIfStatement", test, consequent };
}
export function elseStatement(consequent) {
  return { kind: "ElseStatement", consequent };
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
export function functionDeclaration(name, parameters, returnType, body) {
  return { kind: "FunctionDeclaration", name, parameters, returnType, body };
}
export function binaryExpression(op, left, right, type) {
  return { kind: "BinaryExpression", op, left, right, type };
}
export function subscript(list, index) {
  return { kind: "Subscript", list, index, type: list.type.baseType };
}
export function emptyListExpression(type) {
  return { kind: "EmptyListExpression", type };
}
export function listExpression(elements) {
  return { kind: "ListExpression", elements };
}
export function call(callee, args) {
  return { kind: "Call", callee, args, type: callee.type.returnType };
}
export const standardLibrary = Object.freeze({
  number: numberType,
  boolean: boolType,
  string: stringType,
});

String.prototype.type = stringType;
Number.prototype.type = numberType;
Boolean.prototype.type = boolType;
