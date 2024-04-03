/**
ToDo: Try following approach for writing converters. We will see the resulting structure this way. Follow DRY.

const convert = (node) => {
  const result = {
    ...node,
    b: node.B,
    c: node.C.map(i => ({...}))
  }
  delete result.B;
  delete result.C;
  return result;
}

 */


import type { IConverter, INode } from "../types";

const checkNodeType = (t: string) => t === 'n8n-nodes-base.merge';

const ver1: IConverter = {
  predicate: (node: INode) => {
    return checkNodeType(node.type) && node.typeVersion === 1;
  },

  convert: (node: INode) => {
    const result: INode = {
      ...node,
      typeVersion: 2.1,
      parameters: node.parameters.map(p => {

        switch (p.mode) {
          case 'removeKeyMatches':
            p = {
              ...p,
              mode: 'combine',
              mergeByFields: {
                values: [
                  {
                    field1: p.propertyName1,
                    field2: p.propertyName2,
                  },
                ],
              },
              joinMode: 'keepNonMatches',
              outputDataFrom: 'input1',
              options: {},
            }
            // Remove old mode-related fields
            delete p.propertyName1;
            delete p.propertyName2;
            break;
          case 'keepKeyMatches':
            p = {
              ...p,
              mode: 'combine',
              mergeByFields: {
                values: [
                  {
                    field1: p.propertyName1,
                    field2: p.propertyName2,
                  },
                ],
              },
              outputDataFrom: 'input1',
              options: {},
            }
            // Remove old mode-related fields
            delete p.propertyName1;
            delete p.propertyName2;
            break;
          case 'multiplex':
            p = {
              ...p,
              mode: 'combine',
              combinationMode: 'multiplex',
              options: {},
            }
            break;
          case 'wait':
            p = {
              ...p,
              mode: 'chooseBranch',
              output: 'empty',
            }
            break;
          case 'passThrough':
            p.mode = 'chooseBranch';
            break;
          case 'mergeByIndex':
            p = {
              ...p,
              mode: 'combine',
              combinationMode: 'mergeByPosition',
              options: {
                ...p.options,
                // Add 'includeUnpaired' only if p.join is 'outer'
                ...(p.join === 'outer' ? { includeUnpaired: true } : {}),
                // Override or define clashHandling if p.join is undefined
                ...(p.join === undefined ? {
                  clashHandling: {
                    values: {
                      resolveClash: 'preferInput2',
                    },
                  },
                } : {}),
              },
            };
            // Remove old mode-related fields
            delete p.join;
            break;
          case 'mergeByKey':
            p = {
              ...p,
              mode: 'combine',
              joinMode: 'enrichInput1',
              mergeByFields: {
                values: [
                  {
                    field1: p.propertyName1,
                    field2: p.propertyName2,
                  },
                ],
              },
              options: {
                ...p.options,
                // Add options for 'overwrite' being 'blank'
                ...(p.overwrite === 'blank' ? {
                  clashHandling: {
                    values: {
                      resolveClash: 'preferInput1',
                      mergeMode: 'shallowMerge',
                      overrideEmpty: true, // This handles the "if blank" condition
                    },
                  },
                } : {}),
                // Add options for 'overwrite' being defined
                ...(p.overwrite ? {
                  clashHandling: {
                    values: {
                      resolveClash: 'preferInput1',
                      mergeMode: 'shallowMerge',
                    },
                  },
                } : {}),
              },
            };
            // Remove old mode-related fields
            delete p.overwrite;
            delete p.propertyName1;
            delete p.propertyName2;
            break;
          default:
            break; // ToDo: Throw an error?
        }

        return p;
      }),
    }
    return "";
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
