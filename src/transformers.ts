// transformers.ts

import { INode } from "./lib/utils/types";
import { converters } from "./converters";

export function transform(nodes: INode[]): void {
  nodes.forEach((node) => {
    for (const [predicate, transform] of converters) {
      if (predicate(node)) {
        const result = transform(node);
        console.log(result);
        break;
      }
    }
  });
}