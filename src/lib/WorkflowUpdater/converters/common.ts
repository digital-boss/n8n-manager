import type { OperationMappings } from "../types";

export const operationMappings: OperationMappings = {
  string: {
    notEqual: "notEquals",
    isEmpty: "notExists",
    isNotEmpty: "exists",
    default: "equals",
  },
  number: {
    smallerEqual: "lte",
    equal: "equals",
    notEqual: "notEquals",
    larger: "gt",
    largerEqual: "gte",
    isEmpty: "notExists",
    isNotEmpty: "exists",
    default: "lt",
  },
  dateTime: {
    default: "after",
  },
  boolean: {
    notEqual: "notEquals",
    default: "equals",
  },
};

export function setDefaultValues(value: any, defaultValue: any, type: string, operation: string): any {
  if (type === "string" && (operation === "exists" || operation === "notExists")) {
    return value || "";
  }
  return value || defaultValue;
}
