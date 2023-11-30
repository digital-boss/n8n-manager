import { INode } from "src/lib/utils/WorkflowUpdated";

export class SetNode {
  // Define the conditions and corresponding functions

  private static versionConverters: [
    (node: INode) => boolean,
    (node: INode) => boolean
  ][] = [
    [SetNode.hasTypeVersion1, SetNode.modifySetNodeV1],
    [SetNode.hasTypeVersion2, SetNode.modifySetNodeV2],
  ];

  //TODO Add n8n version check to predicate

  // Define the conditions for each version
  private static hasTypeVersion1(node: INode): boolean {
    return node.typeVersion === 1;
  }

  private static hasTypeVersion2(node: INode): boolean {
    return node.typeVersion === 2;
  }

  // Version-specific functions
  private static modifySetNodeV1(node: INode): boolean {
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
    return true;
  }

  private static modifySetNodeV2(node: INode): boolean {
    return false;
  }

  // Main convert method
  public static convert(node: INode): boolean {
    let isChanged = false;
    for (const [condition, modifyFunction] of SetNode.versionConverters) {
      if (condition(node)) {
        isChanged = modifyFunction(node);
      }
    }
    return isChanged;
  }
}
