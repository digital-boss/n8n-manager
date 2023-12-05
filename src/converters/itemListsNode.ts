import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.itemLists';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.typeVersion = 3;

    if (node.parameters.operation === 'aggregateItems') {
      node.parameters.operation = 'concatenateItems';

      if (node.parameters.include === 'specifiedFields' && node.parameters.fieldsToInclude && node.parameters.fieldsToInclude.fields) {
        const fieldsToInclude = Array.isArray(node.parameters.fieldsToInclude.fields)
          ? node.parameters.fieldsToInclude.fields.map((field: any) => field.fieldName)
          : node.parameters.fieldsToInclude.fields;

        node.parameters.fieldsToInclude = fieldsToInclude.length === 1 ? fieldsToInclude[0] : fieldsToInclude;

        delete node.parameters.fieldsToInclude.fields;
      } else if (node.parameters.include === 'allFieldsExcept' && node.parameters.fieldsToExclude && node.parameters.fieldsToExclude.fields) {
        const fieldsToExclude = Array.isArray(node.parameters.fieldsToExclude.fields)
          ? node.parameters.fieldsToExclude.fields.map((field: any) => field.fieldName)
          : node.parameters.fieldsToExclude.fields;

        node.parameters.fieldsToExclude = fieldsToExclude.length === 1 ? fieldsToExclude[0] : fieldsToExclude;

        delete node.parameters.fieldsToExclude.fields;
      }
    } else if (node.parameters.operation === 'removeDuplicates') {
      if (node.parameters.fieldsToCompare && node.parameters.fieldsToCompare.fields) {
        const fieldsToCompare = Array.isArray(node.parameters.fieldsToCompare.fields)
          ? node.parameters.fieldsToCompare.fields.map((field: any) => field.fieldName)
          : node.parameters.fieldsToCompare.fields;

        node.parameters.fieldsToCompare = fieldsToCompare.length === 1 ? fieldsToCompare[0] : fieldsToCompare;

        delete node.parameters.fieldsToCompare.fields;
      } else if (node.parameters.fieldsToExclude && node.parameters.fieldsToExclude.fields) {
        const fieldsToExclude = Array.isArray(node.parameters.fieldsToExclude.fields)
          ? node.parameters.fieldsToExclude.fields.map((field: any) => field.fieldName)
          : node.parameters.fieldsToExclude.fields;

        node.parameters.fieldsToExclude = fieldsToExclude.length === 1 ? fieldsToExclude[0] : fieldsToExclude;

        delete node.parameters.fieldsToExclude.fields;
      }
    } else if (node.parameters.fieldToSplitOut && node.parameters.include === 'selectedOtherFields') {
      const fieldsToInclude = Array.isArray(node.parameters.fieldsToInclude.fields)
        ? node.parameters.fieldsToInclude.fields.map((field: any) => field.fieldName)
        : node.parameters.fieldsToInclude.fields;

      node.parameters.fieldsToInclude = fieldsToInclude.length === 1 ? fieldsToInclude[0] : fieldsToInclude;

      delete node.parameters.fieldsToInclude.fields;
    }
    if (node.parameters.operation == 'summarize') {
      const additionalText =
        'Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"';
      return additionalText
    } else {
      return `Successfully updated Interval node ${node.name} to version 3`;
    }
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

export const itemListsNodeConv: IConverter[] = [
  ver1,
  ver2
];
