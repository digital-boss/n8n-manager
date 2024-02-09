import type { OperationMappings } from "../types";

// Mapping for if t.v 1 to 2 and switch node from t.v. 2 to t.v.3
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

export const setDefaultValues = (value: any, defaultValue: any, type: string, operation: string) => {
  if (type === "string" && (operation === "exists" || operation === "notExists")) {
    return value || "";
  }
  return value || defaultValue;
}
