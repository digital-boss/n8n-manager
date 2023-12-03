import { IConverter, INode } from "src/lib/utils/types";

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
    return `Successfully updated Interval node ${node.name} to version 2`;;
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
