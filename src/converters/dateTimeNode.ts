import { Converter, INode } from "src/lib/utils/types";


// Define the conditions for each version
function hasTypeVersion1(node: INode): boolean {
  return node.type === 'n8n-nodes-base.dateTime' && node.typeVersion === 1;
}

function hasTypeVersion2(node: INode): boolean {
  return node.type === 'n8n-nodes-base.dateTime' && node.typeVersion === 2;
}

  // Version-specific functions
  function modifyDateTimeNodeV1(node: INode): string {
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

}

function modifyDateTimeNodeV2(node: INode): string {
  node.typeVersion = 3;

  return 'You need manually update the node.';
}
 
export const dateTimeNodeConv: Converter[] = [
  [hasTypeVersion1, modifyDateTimeNodeV1],
  [hasTypeVersion2, modifyDateTimeNodeV2],
]
