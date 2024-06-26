import type { IConverter } from "../types";
import { operationMappings } from "./common";
import { v4 as uuid4 } from 'uuid';

const checkNodeType = (t: string) => t === 'n8n-nodes-base.if';


const setDefaultValues = (value: any, defaultValue: any, type: string, operation: string) => {
  if (type === "string" && (operation === "exists" || operation === "notExists")) {
    return value || "";
  }
  return value || defaultValue;
};

const convertOperation = (type: string, oldConditions: any) => {
  return oldConditions.operation
    ? operationMappings[type]?.[oldConditions.operation] || oldConditions.operation
    : operationMappings[type]?.default || "equals";
};

const ver1: IConverter = {
  predicate: (node) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node) => {
    let todoMessage = "";

    if (node.parameters.conditions) {
      const conditionType = Object.keys(node.parameters.conditions).find(key => Array.isArray(node.parameters.conditions[key]));

      if (conditionType) {
        const oldConditions = node.parameters.conditions[conditionType][0];
        const type = conditionType;
        const operation = convertOperation(type, oldConditions);

        if (type === "dateTime") {
          todoMessage = 'New node version only supports DateTime values in the format YYYY-MM-DD (e.g., "2022-09-08"). Please ensure your configurations adhere to this format.';
        }

        // Set default values for value1 and value2
        oldConditions.value1 = setDefaultValues(oldConditions.value1, type === "number" ? 0 : false, type, operation);
        oldConditions.value2 = setDefaultValues(oldConditions.value2, type === "number" ? 0 : false, type, operation);

        // Create the new conditions structure
        const newConditions = {
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

        node.parameters.conditions = newConditions;
        node.parameters.options = {};
        node.typeVersion = 2;
      }
    }

    return todoMessage;
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
