import type { IConverter, INode } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.start';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.type = 'n8n-nodes-base.manualTrigger';

    return "";
  }
}

const ver2: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 2;
  },

  convert: (node: INode) => {
    return 'Yon need manually update the node';
  }
}

export const startNodeConv: IConverter[] = [
  ver1,
  ver2
];
