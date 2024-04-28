#! /usr/bin/env node
import * as fs from "node:fs/promises";
import process from "process";
import compile from "./compiler.js";
//import { Program } from "./core.js";
import stringify from "graph-stringify";
const help = `blvd compiler
Syntax: blvd <filename> <outputType>
Prints to stdout according to <outputType>, which must be one of:
  parsed     a message that the program was matched ok by the grammar
  analyzed   the statically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
`;
async function compileFromFile(filename, outputType) {
  const buffer = await fs.readFile(filename);
  const compiled = compile(buffer.toString(), outputType);
  if (typeof compiled === "string") {
    console.log(compiled);
  } else {
    console.log(stringify(compiled) || "Syntax ok");
  }
}
if (process.argv.length !== 4) {
  console.log(help);
} else {
  compileFromFile(process.argv[2], process.argv[3]);
}
