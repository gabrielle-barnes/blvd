import assert from "node:assert/strict"
import compile from "../src/compiler.js"

// Test for valid syntax
assert.strictEqual(compile("valid javascript code"), "Syntax is ok");

// Test for invalid syntax
assert.throws(() => {
  compile("invalid javascript code");
}, /Syntax error/);

console.log("All tests passed successfully.");
