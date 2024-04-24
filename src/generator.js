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
      output.push(`function ${targetName(d)}(${d.parameters.map(gen).join(", ")})`);
      gen(d.body);
    },
    PrintStatement(p) {
      output.push(`console.log(${gen(p.expression)});`);
    },
    Variable(v) {
      return targetName(v);
    },
    AssignmentStatement(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`);
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`);
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)})`);
      gen(s.consequent);
      s.alternates.forEach(gen);
      gen(s.tail?.[0]);
    },
    ElseIfStatement(s) {
      output.push(`else if (${gen(s.test)})`);
      gen(s.consequent);
    },
    ElseStatement(s) {
      output.push(`else`);
      gen(s.consequent);
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)})`);
      gen(s.body);
    },
    ForStatement(s) {
      const i = targetName(s.iterator);
      const lowerbound = gen(s.low);
      const upperbound = gen(s.high);
      const forLoopHeader = `for (let ${i} = ${lowerbound}; ${i} < ${upperbound}; ${i}++)`;
      output.push(forLoopHeader);
      gen(s.body);
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
    Call(c) {
      const argsCode = c.args.map(gen).join(", ");
      const targetCode = `${targetName(c.callee)}(${argsCode})`;

      return targetCode;
    },
  };

  gen(program);
  return output.join("\n");
}
