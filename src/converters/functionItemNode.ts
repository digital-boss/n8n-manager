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

        // Rename functionCode to jsCode and replace "item" with "item.json"
        node.parameters.jsCode = node.parameters.functionCode.replace(/\bitem\b/g, 'item.json');

        delete node.parameters.functionCode; // Remove old field

        // if (!workflowChanges.nodeNames.includes(node.name)) {
        //     nodeModified = true;

        //     // Add the function node to the TODO list with specific text
        //     const additionalText = 'The node needs to be tested manually. Check the access to the input data and the returned format.';
        //     todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
        // }
        return `Successfully updated FunctionItem node ${node.name} to version 2`;;
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
