import { IConverter, INode } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.itemLists';

const updateFields = (fields: any) => {
  if (fields?.fields) {
    const extractedFields = Array.isArray(fields.fields)
      ? fields.fields.map((field: any) => field.fieldName)
      : fields.fields;

    fields = extractedFields.length === 1 ? extractedFields[0] : extractedFields;
    delete fields.fields;
  }
  return fields;
};

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.typeVersion = 3;

    let additionalText = "";
    
    if (node.parameters.operation === 'aggregateItems') {
      node.parameters.operation = 'concatenateItems';

      if (node.parameters.include === 'specifiedFields') {
        node.parameters.fieldsToInclude = updateFields(node.parameters.fieldsToInclude);
      } else if (node.parameters.include === 'allFieldsExcept') {
        node.parameters.fieldsToExclude = updateFields(node.parameters.fieldsToExclude);
      }
    } else if (node.parameters.operation === 'removeDuplicates') {
      if (node.parameters.fieldsToCompare) {
        node.parameters.fieldsToCompare = updateFields(node.parameters.fieldsToCompare);
      } else if (node.parameters.fieldsToExclude) {
        node.parameters.fieldsToExclude = updateFields(node.parameters.fieldsToExclude);
      }
    } else if (node.parameters.fieldToSplitOut && node.parameters.include === 'selectedOtherFields') {
      node.parameters.fieldsToInclude = updateFields(node.parameters.fieldsToInclude);
    }

    if (node.parameters.operation === 'summarize') {
      return additionalText = 'Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"';
    } else {
      return `Successfully updated Interval node ${node.name} to version 3`;
    }
  }
};

const ver2: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 2;
  },

  convert: (node: INode) => {
    return 'You need to manually update the node';
  }
};

export const itemListsNodeConv: IConverter[] = [
  ver1,
  ver2
];
