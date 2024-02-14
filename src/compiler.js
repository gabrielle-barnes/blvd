import parse from "./parser.js"

export default function compile(source) {
  try {
    parse(source)
    return "Syntax is ok"
  } catch (e) {
    console.error(`Syntax error: ${e}`)
  }
}
