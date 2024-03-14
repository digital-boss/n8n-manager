import type { IConverter, INode, ConvertionResult } from "./types";

export function transform(converters: IConverter[], nodes: INode[]): ConvertionResult[] {

  const resultArray: ConvertionResult[] = []; // Collect all transformation results here

  nodes.forEach((node) => {
    // ToDo: make node immutable (Object.freeze) and pass immutable object into predicate and converter.
    // This is how we make sure that no predicate and converter mutate node.
    for (const conv of converters) {
      if (conv.predicate(node)) {
        const result = conv.convert(node);
        const nodeType = node.type.substring(node.type.lastIndexOf('.') + 1);
        resultArray.push({ nodeName: node.name, result, nodeType });
        break;
      }
    }
  });

  return resultArray;
}
