import { INode } from "src/lib/utils/types";

export class DateTimeNode {
  // Define the conditions and corresponding functions

  private static versionConverters: [
    (node: INode) => boolean,
    (node: INode) => boolean
  ][] = [
    [DateTimeNode.hasTypeVersion1, DateTimeNode.modifyDateTimeNodeV1],
    [DateTimeNode.hasTypeVersion2, DateTimeNode.modifyDateTimeNodeV2],
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
  private static modifyDateTimeNodeV1(node: INode): boolean {
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
    return true;
  }

  private static modifyDateTimeNodeV2(node: INode): boolean {
    return false;
  }

  // Main convert method
  public static convert(node: INode): boolean {
    let isChanged = false;
    for (const [condition, modifyFunction] of DateTimeNode.versionConverters) {
      if (condition(node)) {
        isChanged = modifyFunction(node);
      }
    }
    return isChanged;
  }
}
