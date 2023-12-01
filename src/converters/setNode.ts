import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.set';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.typeVersion = 3;

    const transformedValues: any[] = [];

    // Transform "number" values
    if (
      node.parameters.values.number &&
      node.parameters.values.number.length > 0
    ) {
      node.parameters.values.number.forEach((numberValue: any) => {
        transformedValues.push({
          name: numberValue.name,
          type: "numberValue",
          numberValue: numberValue.value,
        });
      });
    }

    // Transform "string" values
    if (
      node.parameters.values.string &&
      node.parameters.values.string.length > 0
    ) {
      node.parameters.values.string.forEach((stringValue: any) => {
        transformedValues.push({
          name: stringValue.name,
          stringValue: stringValue.value,
          type: "stringValue",
        });
      });
    }

    // Transform "boolean" values
    if (
      node.parameters.values.boolean &&
      node.parameters.values.boolean.length > 0
    ) {
      node.parameters.values.boolean.forEach((booleanValue: any) => {
        transformedValues.push({
          name: booleanValue.name,
          type: "booleanValue",
        });
      });
    }

    // Update the parameters structure
    node.parameters = {
      fields: {
        values: transformedValues,
      },
      options: node.parameters.options,
    };

    if ((node.parameters.keepOnlySet = true)) {
      node.parameters.include = "none";
      delete node.parameters.keepOnlySet;
    }
    return `Successfully updated Set node ${node.name} to version 2`;;
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

export const setNodeConv: IConverter[] = [
  ver1,
  ver2
];
