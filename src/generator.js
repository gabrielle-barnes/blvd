export default function generate(program) {
  const output = [];

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1);
      }
      return `${entity.name}_${mapping.get(entity)}`;
    };
  })(new Map());

  const gen = (node) => generators?.[node?.kind]?.(node) ?? node;

  const generators = {
    Program(p) {
      p.statements.forEach(gen);
    },
    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
    },
    FunctionDeclaration(d) {
      output.push(`function ${gen(d.fun)}(${d.params.map(gen).join(", ")}) {`);
      d.body.forEach(gen);
      output.push("}");
    },
    Variable(v) {
      return targetName(v);
    },
    Function(f) {
      return targetName(f);
    },
    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`);
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`);
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`);
      s.consequent.forEach(gen);
      if (s.alternate?.kind?.endsWith?.("IfStatement")) {
        output.push("} else");
        gen(s.alternate);
      } else {
        output.push("} else {");
        s.alternate.forEach(gen);
        output.push("}");
      }
    },
    ShortIfStatement(s) {
      output.push(`if (${gen(s.test)}) {`);
      s.consequent.forEach(gen);
      output.push("}");
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`);
      s.body.forEach(gen);
      output.push("}");
    },
    ForRangeStatement(s) {
      const i = targetName(s.iterator);
      const op = s.op === "..." ? "<=" : "<";
      output.push(`for (let ${i} = ${gen(s.low)}; ${i} ${op} ${gen(s.high)}; ${i}++) {`);
      s.body.forEach(gen);
      output.push("}");
    },
    Conditional(e) {
      return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(e.alternate)}))`;
    },
    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op;
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },
    SubscriptExpression(e) {
      return `${gen(e.array)}[${gen(e.index)}]`;
    },
    ArrayExpression(e) {
      return `[${e.elements.map(gen).join(",")}]`;
    },
    EmptyArray(e) {
      return "[]";
    },
    FunctionCall(c) {
      const targetCode = standardFunctions.has(c.callee)
        ? standardFunctions.get(c.callee)(c.args.map(gen))
        : `${gen(c.callee)}(${c.args.map(gen).join(", ")})`;
      // Calls in expressions vs in statements are handled differently
      if (c.callee.type.returnType !== voidType) {
        return targetCode;
      }
      output.push(`${targetCode};`);
    },
  };

  gen(program);
  return output.join("\n");
}
