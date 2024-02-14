import parse from "./parser.js"

export default function compile(source, outputType) {
  if (!["parsed"].includes(outputType)) {
    throw new Error("Unknown output type")
  }
  if (outputType === "parsed") return "Syntax is ok"
}
