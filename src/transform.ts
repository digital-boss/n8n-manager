import { IConverter, INode } from "./lib/utils/types";

export function transform(converters: IConverter[], nodes: INode[]): void {
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