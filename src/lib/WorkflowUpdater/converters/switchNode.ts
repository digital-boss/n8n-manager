import { IConverter, INode, Rule } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.switch';

const ver1: IConverter = {
    predicate: (node: INode) => {
        return checkNodeType(node.type) && node.typeVersion === 1;
    },

    convert: (node: INode) => {
        node.typeVersion = 2;

        if (node.parameters.rules.rules) {
            //Loop through each rule
            node.parameters.rules.rules.forEach((rule: Rule) => {
                rule.outputKey = rule.output;
                delete rule.output;

                if (!rule.outputKey) {
                    rule.outputKey = 0;
                }

            })
            // Set fallbackOutput to the last outputKey value
            const lastRule = node.parameters.rules.rules[node.parameters.rules.rules.length - 1];
            if (node.parameters.fallbackOutput) {
                node.parameters.fallbackOutput = lastRule.outputKey;
            }
        }
        return `Successfully updated Interval node ${node.name} to version 2`;
    }

};

const ver2: IConverter = {
    predicate: (node: INode) => {
        return checkNodeType(node.type) && node.typeVersion === 2;
    },

    convert: (node: INode) => {
        return 'You need to manually update the node';
    }
};


export const switchNodeConv: IConverter[] = [
    ver1,
    ver2,
];
