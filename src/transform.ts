import { IConverter, INode } from "./lib/utils/types";
import { ChangedNodeInformation } from "./lib/utils/types";

export function transform(converters: IConverter[], nodes: INode[]): ChangedNodeInformation[] {
  
  const resultArray: ChangedNodeInformation[] = []; // Collect all transformation results here

  nodes.forEach((node) => {
    for (const conv of converters) {
      if (conv.predicate(node)) {
        const result = conv.convert(node);
        const nodeType = node.type.substring(node.type.lastIndexOf('.') + 1);
        resultArray.push({ nodeName: node.name, additionalText: result, type: nodeType });
        break;
      }
    }
  });

  return resultArray;
}
