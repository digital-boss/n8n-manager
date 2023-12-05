import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.functionItem';

const ver1: IConverter = {
    predicate: (node: INode) => {
        return checkNodeType(node.type) && node.typeVersion === 1;
    },

    convert: (node: INode) => {
        node.type = 'n8n-nodes-base.code';
        node.typeVersion = 2;
        node.parameters.mode = "runOnceForEachItem";
        node.parameters.jsCode = node.parameters.functionCode.replace(/\bitem\b/g, 'item.json');

        delete node.parameters.functionCode; 
        
        const additionalText = 'The node needs to be tested manually. Check the access to the input data and the returned format.';
        
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

export const functionItemNodeConv: IConverter[] = [
    ver1,
    ver2
];
