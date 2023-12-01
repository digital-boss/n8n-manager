import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.dateTime';

const ver1: IConverter = {
  predicate: (node) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node) => {
    node.parameters.outputFieldName = node.parameters.dataPropertyName;
    node.typeVersion = 2;
  
    if (node.parameters.action === "calculate") {
      node.parameters.operation = "subtractFromDate";
      node.parameters.magnitude = node.parameters.value;
    } else {
      node.parameters.operation = "formatDate";
      node.parameters.date = node.parameters.value;
  
      if (node.parameters.toFormat) {
        // Define the format for formatting scenario
        const formatMapping: Record<string, string> = {
          "YYYY/MM/DD": "yyyy/MM/dd",
          "MMMM DD YYYY": "MMMM dd yyyy",
          "MM-DD-YYYY": "MM-dd-yyyy",
          "YYYY-MM-DD": "yyyy-MM-dd",
        };
  
        node.parameters.format =
          formatMapping[node.parameters.toFormat] || node.parameters.toFormat;
      }
      delete node.parameters.toFormat;
    }
  
    delete node.parameters.dataPropertyName;
    delete node.parameters.value;
  
    return `Successfully updated DateTime node ${node.name} to version 2`;
  },
}

const ver2: IConverter = {
  predicate: (node) => {
    return checkNodeType(node.type) && node.typeVersion === 2;
  },

  convert: (node) => {
    return 'Yon need manually update the node';
  },
}

export const dateTimeNodeConv: IConverter[] = [
  ver1,
  ver2,
];