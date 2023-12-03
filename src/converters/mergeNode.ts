import { IConverter, INode } from "src/lib/utils/types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.merge';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    node.typeVersion = 2.1;

    switch (node.parameters.mode) {
      case 'removeKeyMatches':
        node.parameters.mode = 'combine';
        node.parameters.mergeByFields = {
          values: [
            {
              field1: node.parameters.propertyName1,
              field2: node.parameters.propertyName2,
            },
          ],
        };
        node.parameters.joinMode = 'keepNonMatches';
        node.parameters.outputDataFrom = 'input1';
        node.parameters.options = {};

        // Remove old mode-related fields
        delete node.parameters.propertyName1;
        delete node.parameters.propertyName2;
        break;
      case 'keepKeyMatches':
        node.parameters.mode = 'combine';
        node.parameters.mergeByFields = {
          values: [
            {
              field1: node.parameters.propertyName1,
              field2: node.parameters.propertyName2,
            },
          ],
        };
        node.parameters.outputDataFrom = 'input1';
        node.parameters.options = {};

        // Remove old mode-related fields
        delete node.parameters.propertyName1;
        delete node.parameters.propertyName2;
        break;
      case 'multiplex':
        node.parameters.mode = 'combine';
        node.parameters.combinationMode = 'multiplex';
        node.parameters.options = {};
        break;
      case 'wait':
        node.parameters.mode = 'chooseBranch';
        node.parameters.output = 'empty';
        break;
      case 'passThrough':
        node.parameters.mode = 'chooseBranch';
        break;
      case 'mergeByIndex':
        node.parameters.mode = 'combine';
        node.parameters.combinationMode = 'mergeByPosition';

        // Create the options object if it's undefined
        node.parameters.options = node.parameters.options || {};
        if (node.parameters.join == 'outer') {
          // Set the property 'includeUnpaired' on the options object
          node.parameters.options.includeUnpaired = true;
        } else if (!node.parameters.join) {
          node.parameters.options = {
            clashHandling: {
              values: {
                resolveClash: 'preferInput2',
              },
            },
          };
        }

        delete node.parameters.join;
        break;
      case 'mergeByKey':
        node.parameters.mode = 'combine';
        node.parameters.joinMode = 'enrichInput1';
        node.parameters.mergeByFields = {
          values: [
            {
              field1: node.parameters.propertyName1,
              field2: node.parameters.propertyName2,
            },
          ],
        };
        if (node.parameters.overwrite === 'blank') {
          // Create the options object if it's undefined
          node.parameters.options = node.parameters.options || {};

          // Add the necessary options for "overwrite" being "blank"
          node.parameters.options.clashHandling = {
            values: {
              resolveClash: 'preferInput1',
              mergeMode: 'shallowMerge',
              overrideEmpty: true, // This handles the "if blank" condition
            },
          };

          // Remove the "overwrite" property after using it
          delete node.parameters.overwrite;
        }
        if (node.parameters.overwrite) {
          // Create the options object if it's undefined
          node.parameters.options = node.parameters.options || {};

          // Add the necessary options for "overwrite" being "blank"
          node.parameters.options.clashHandling = {
            values: {
              resolveClash: 'preferInput1',
              mergeMode: 'shallowMerge',
            },
          };
          delete node.parameters.overwrite;
        }
        delete node.parameters.propertyName1;
        delete node.parameters.propertyName2;
        break;
      default:
        break;
    }
    return `Successfully updated Merge node ${node.name} to version 2.1`;;
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

export const mergeNodeConv: IConverter[] = [
  ver1,
  ver2
];
