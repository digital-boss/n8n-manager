import { Converter, INode } from "src/lib/utils/types";

  // Define the conditions for each version
  function hasTypeVersion1(node: INode): boolean {
    return node.type === 'n8n-nodes-base.set' && node.typeVersion === 1;
  }

  function hasTypeVersion2(node: INode): boolean {
    return node.type === 'n8n-nodes-base.set' && node.typeVersion === 2;
  }

  // Version-specific functions
  function modifySetNodeV1(node: INode): string {
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

  function modifySetNodeV2(node: INode): string {
    return "You need manually update the node"
  }

export const setNodeConv: Converter[] = [
  [hasTypeVersion1, modifySetNodeV1],
  [hasTypeVersion2, modifySetNodeV2],
];

