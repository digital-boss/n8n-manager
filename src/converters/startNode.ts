import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.start';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.type = 'n8n-nodes-base.manualTrigger';
    // if (!workflowChanges.nodeNames.includes(node.name)) {
    //   nodeModified = true;
    // }

    return `Successfully updated Start node ${node.name} to version 2`;;
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
