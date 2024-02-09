import type { IConverter, INode, Rule } from "../types";
import { operationMappings, setDefaultValues } from './common';

const checkNodeType = (t: string) => t === 'n8n-nodes-base.switch';

const convertOperation = (type: string, oldOperation: string) => {
    if ((type === "dateTime" || type === "string") && oldOperation) {
        return oldOperation;
    }

    return operationMappings[type]?.[oldOperation] || operationMappings[type]?.default || "equals";
};

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
        return "";
    }

};

const ver2: IConverter = {
    predicate: (node: INode) => checkNodeType(node.type) && node.typeVersion === 2,

    convert: (node: INode) => {
        node.typeVersion = 3;
        let todoMessage = "";
        node.parameters.dataType = node.parameters.dataType || "number";

        if (node.parameters.rules && node.parameters.rules.rules) {
            const oldRules = node.parameters.rules.rules;
            const newValues = oldRules.map((rule: { outputKey?: any; operation?: any; value2?: any; }) => {
                const { operation, value2, outputKey } = rule;
                const mappedOperation = convertOperation(node.parameters.dataType, operation);
                const defaultValue = setDefaultValues(
                    value2,
                    node.parameters.dataType === "number" ? 0 : false,
                    node.parameters.dataType,
                    mappedOperation
                );

                const conditions = {
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: "",
                            typeValidation: "strict",
                        },
                        conditions: [
                            {
                                id: node.id,
                                leftValue: node.parameters.value1 || defaultValue,
                                rightValue: defaultValue,
                                operator: {
                                    type: node.parameters.dataType,
                                    operation: mappedOperation,
                                },
                            },
                        ],
                        combinator: "and",
                    },
                    outputKey,
                };
                if (node.parameters.dataType === "dateTime") {
                    todoMessage = 'New node version only supports DateTime values in the format YYYY-MM-DD (e.g., "2022-09-08"). Please ensure your configurations adhere to this format.';
                }
                // Explicitly set the mapped operation in the operator
                conditions.conditions.conditions[0].operator.operation = mappedOperation;
                return conditions;
            });
            node.parameters.rules.values = newValues;
            delete node.parameters.rules.rules;
        }

        // Set fallbackOutput in node.parameters.options
        if (node.parameters.fallbackOutput !== undefined) {
            node.parameters.options = {
                fallbackOutput: "extra",
            };
        } else {
            node.parameters.options = {};
        }

        // Delete unnecessary properties
        delete node.parameters.fallbackOutput;
        delete node.parameters.value1;
        delete node.parameters.dataType;

        return todoMessage;
    }
};

export const switchNodeConv: IConverter[] = [
    ver1,
    ver2,
];
