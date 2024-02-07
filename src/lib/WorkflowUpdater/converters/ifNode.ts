import type { IConverter } from "../types";
import { operationMappings, setDefaultValues } from './common';
import { v4 as uuid4 } from 'uuid';

const checkNodeType = (t: string) => t === 'n8n-nodes-base.if';

const convertOperation = (type: string, oldConditions: any) => {
  return oldConditions.operation
    ? operationMappings[type]?.[oldConditions.operation] || oldConditions.operation
    : operationMappings[type]?.default || "equals";
};

const setDefaultValuesForConditions = (oldConditions: any, type: string, operation: string) => {
  oldConditions.value1 = setDefaultValues(oldConditions.value1, type === "number" ? 0 : false, type, operation);
  oldConditions.value2 = setDefaultValues(oldConditions.value2, type === "number" ? 0 : false, type, operation);
};

const createNewConditionsStructure = (oldConditions: any, type: string, operation: string) => {
  return {
    options: {
      caseSensitive: true,
      leftValue: "",
      typeValidation: "strict",
    },
    conditions: [
      {
        id: uuid4(), // Generate a unique ID
        leftValue: oldConditions.value1,
        rightValue: oldConditions.value2,
        operator: {
          type: type,
          operation: operation,
        },
      },
    ],
    combinator: "and",
  };
};

const updateNodeParameters = (node: any, newConditions: any) => {
  node.parameters.conditions = newConditions;
  node.parameters.options = {};
  node.typeVersion = 2;
};

const ver1: IConverter = {
  predicate: (node) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node) => {
    let additionalText = "";

    if (node.parameters.conditions) {
      const conditionType = Object.keys(node.parameters.conditions).find(key => Array.isArray(node.parameters.conditions[key]));

      if (conditionType) {
        const oldConditions = node.parameters.conditions[conditionType][0];
        const type = conditionType;
        const operation = convertOperation(type, oldConditions);

        if (type === "dateTime") {
          additionalText = 'New node version only supports DateTime values in the format YYYY-MM-DD (e.g., "2022-09-08"). Please ensure your configurations adhere to this format.';
        }

        setDefaultValuesForConditions(oldConditions, type, operation);

        const newConditions = createNewConditionsStructure(oldConditions, type, operation);

        updateNodeParameters(node, newConditions);
      }
    }

    return additionalText || `Successfully updated If node ${node.name} to version ${node.typeVersion}`;
  },
};

const ver2: IConverter = {
  predicate: (node) => {
    return checkNodeType(node.type) && node.typeVersion === 3;
  },

  convert: (node) => {
    return 'You need to manually update the node';
  },
};

export const ifNodeConv: IConverter[] = [
  ver1,
  ver2,
];
