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
    Block(s) {
      output.push("{");
      s.statements.forEach(gen);
      output.push("}");
    },
    VariableDeclaration(d) {
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
    },
    FunctionDeclaration(d) {
      console.log("D", d);
      console.log("PARAMS", d.parameters);
      output.push(`function ${gen(d.name)}(${d.parameters.map(gen).join(", ")})`);
      gen(d.body);
    },
    PrintStatement(p) {
      output.push(`console.log(${gen(p.expression)});`);
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
      output.push(`if (${gen(s.test)})`);
      gen(s.consequent);
      s.alternates.forEach(gen);
      gen(s?.tail);
    },
    ElseIfStatement(s) {
      output.push(`else if (${gen(s.test)})`);
      gen(s.consequent);
    },
    ElseStatement(s) {
      console.log("ELSE", s);
      output.push(`else`);
      gen(s.consequent);
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)})`);
      gen(s.body);
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
      const op = { "==": "===", "!=": "!==", is: "===" }[e.op] ?? e.op;
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },
    Subscript(e) {
      return `${gen(e.list)}[${gen(e.index)}]`;
    },
    ListExpression(e) {
      return `[${e.elements.map(gen).join(", ")}]`;
    },
    EmptyListExpression(e) {
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
