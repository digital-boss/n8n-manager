import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.function';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.type = 'n8n-nodes-base.code';
    node.typeVersion = 2;
    node.parameters.jsCode = node.parameters.functionCode;
    delete node.parameters.functionCode;

    const additionalText = 'The node needs to be tested manually. Check the access to the input data and returned format.';

    return additionalText
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

export const functionNodeConv: IConverter[] = [
  ver1,
  ver2
];
