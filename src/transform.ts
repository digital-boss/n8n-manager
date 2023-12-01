// transformers.ts

import { INode } from "./lib/utils/types";
import { converters } from "./converters";

export function transform(nodes: INode[]): void {
  nodes.forEach((node) => {
    for (const conv of converters) {
      if (conv.predicate(node)) {
        const result = conv.convert(node);
        console.log(result);
        break;
      }
    }
  });
}