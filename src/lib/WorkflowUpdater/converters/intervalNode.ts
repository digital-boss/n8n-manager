import type { IConverter, INode } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.interval';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },
  convert: (node: INode) => {

    node.type = 'n8n-nodes-base.scheduleTrigger';
    node.typeVersion = 1.1;

    const intervalField = node.parameters.unit
      ? `${node.parameters.unit}Interval`
      : 'secondsInterval';

    // ToDo: https://github.com/digital-boss/n8n-manager/pull/7#discussion_r1372122433 it seemed to me that interval node can have many rules. A problem: If source node have many, the resulting node will have one.
    node.parameters = {
      rule: {
        interval: [
          {
            field: node.parameters.unit || 'seconds',
            [intervalField]: node.parameters.interval
          }
        ]
      }
    };
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

export const intervalNodeConv: IConverter[] = [
  ver1,
  ver2
];
