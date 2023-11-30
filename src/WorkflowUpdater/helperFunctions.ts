// helperFunctions.ts
import { INode } from 'src/lib/utils/types';

export function modifyHttpRequestNode(node: INode): void {
  node.typeVersion = 4.1;

  if (node.parameters.requestMethod) {
    node.parameters.method = node.parameters.requestMethod;
    delete node.parameters.requestMethod;
  }

  if (node.parameters.queryParametersUi) {
    node.parameters.sendQuery = true;
    node.parameters.queryParameters = {
      parameters: node.parameters.queryParametersUi.parameter,
    };
    delete node.parameters.queryParametersUi;
  }

  if (node.parameters.headerParametersUi) {
    node.parameters.sendHeaders = true;
    node.parameters.headerParameters = {
      parameters: node.parameters.headerParametersUi.parameter,
    };
    delete node.parameters.headerParametersUi;
  }

  if (node.parameters.bodyParametersUi) {
    node.parameters.sendBody = true;
    node.parameters.bodyParameters = {
      parameters: node.parameters.bodyParametersUi.parameter,
    };
    delete node.parameters.bodyParametersUi;
  }

  if (node.parameters.queryParametersJson) {
    node.parameters.sendQuery = true;
    node.parameters.specifyQuery = 'json';
    node.parameters.jsonQuery = node.parameters.queryParametersJson;

    delete node.parameters.queryParametersJson;
    delete node.parameters.jsonParameters;
  }

  if (node.parameters.headerParametersJson) {
    node.parameters.sendHeaders = true;
    node.parameters.specifyHeaders = 'json';
    node.parameters.jsonHeaders = node.parameters.headerParametersJson;

    delete node.parameters.headerParametersJson;
    delete node.parameters.jsonParameters;
  }

  if (node.parameters.bodyParametersJson) {
    node.parameters.sendBody = true;
    node.parameters.specifyBody = 'json';
    node.parameters.jsonBody = node.parameters.bodyParametersJson;

    delete node.parameters.bodyParametersJson;
    delete node.parameters.jsonParameters;
  }

  const method = node.parameters.method;
  delete node.parameters.method;

  // Check for options and transform them if present
  if (node.parameters.options) {
    const updatedOptions: any = {};

    for (const option in node.parameters.options) {
      switch (option) {
        case 'batchInterval':
        case 'batchSize':
          updatedOptions.batching = {
            batch: {
              batchInterval: node.parameters.options.batchInterval,
              batchSize: node.parameters.options.batchSize,
            },
          };
          break;
        case 'fullResponse':
          updatedOptions.response = { response: { fullResponse: node.parameters.options.fullResponse } };
          break;
        case 'followRedirect':
          updatedOptions.redirect = { redirect: {} };
          break;
        case 'ignoreResponseCode':
          updatedOptions.response = { response: { neverError: node.parameters.options.ignoreResponseCode } };
          break;
        case 'proxy':
          updatedOptions.proxy = node.parameters.options.proxy;
          break;
        case 'timeout':
          updatedOptions.timeout = node.parameters.options.timeout;
          break;
        case 'bodyContentType':
          node.parameters.contentType = node.parameters.options.bodyContentType;
          break;
        default:
          break;
      }
    }

    node.parameters.options = updatedOptions;
  }

  if (node.parameters.responseFormat) {
    if(node.parameters.responseFormat === "string"){
      node.parameters.responseFormat = "json";
    }
    node.parameters.options = {
      response: {
        response: {
          responseFormat: node.parameters.responseFormat,
        },
      },
    };
    delete node.parameters.responseFormat;
  }

  if (node.parameters.authentication) {
    const authMethod: string = node.parameters.authentication;

    // Define a map that maps authentication types to genericAuthType values
    const authTypeMap: Record<string, string> = {
      basicAuth: 'httpBasicAuth',
      digestAuth: 'httpDigestAuth',
      headerAuth: 'httpHeaderAuth',
      oAuth1: 'oAuth1Api',
      oAuth2: 'oAuth2Api',
      queryAuth: 'httpQueryAuth',
    };

    if (authTypeMap[authMethod]) {
      node.parameters.genericAuthType = authTypeMap[authMethod];
    }

    node.parameters.authentication = 'genericCredentialType';
  }

  node.parameters = { method, ...node.parameters };
}

export function modifyDateTimeNode(node: INode): void {
  node.parameters.outputFieldName = node.parameters.dataPropertyName;
  node.typeVersion = 2;

  if (node.parameters.action === 'calculate') {
    node.parameters.operation = 'subtractFromDate';
    node.parameters.magnitude = node.parameters.value;
  } else {
    node.parameters.operation = 'formatDate';
    node.parameters.date = node.parameters.value;

    if (node.parameters.toFormat) {
      // Define the format for formatting scenario
      const formatMapping: Record<string, string> = {
        'YYYY/MM/DD': 'yyyy/MM/dd',
        'MMMM DD YYYY': 'MMMM dd yyyy',
        'MM-DD-YYYY': 'MM-dd-yyyy',
        'YYYY-MM-DD': 'yyyy-MM-dd',
      };

      node.parameters.format = formatMapping[node.parameters.toFormat] || node.parameters.toFormat;
    }
    delete node.parameters.toFormat;
  }

  delete node.parameters.dataPropertyName;
  delete node.parameters.value;
}

export function modifyMergeNode(node: INode): void {
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

      node.parameters.options = node.parameters.options || {};
      if (node.parameters.join == 'outer') {
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
        node.parameters.options = node.parameters.options || {};
        node.parameters.options.clashHandling = {
          values: {
            resolveClash: 'preferInput1',
            mergeMode: 'shallowMerge',
            overrideEmpty: true, // This handles the "if blank" condition
          },
        };

        delete node.parameters.overwrite;
      }
      if (node.parameters.overwrite) {
        node.parameters.options = node.parameters.options || {};
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
}

export function modifyItemListsNode(node: INode): void {
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
}

export function modifySetNode(node: INode): void {
  switch (node.typeVersion) {
    case 1:
      // Update typeVersion to 3
      node.typeVersion = 3;

      // Create an array to hold the transformed values
      const transformedValues: any[] = [];

      // Transform "number" values
      if (node.parameters.values.number && node.parameters.values.number.length > 0) {
        node.parameters.values.number.forEach((numberValue: any) => {
          transformedValues.push({
            name: numberValue.name,
            type: 'numberValue',
            numberValue: numberValue.value,
          });
        });
      }

      // Transform "string" values
      if (node.parameters.values.string && node.parameters.values.string.length > 0) {
        node.parameters.values.string.forEach((stringValue: any) => {
          transformedValues.push({
            name: stringValue.name,
            stringValue: stringValue.value,
            type: 'stringValue',
          });
        });
      }

      // Transform "boolean" values
      if (node.parameters.values.boolean && node.parameters.values.boolean.length > 0) {
        node.parameters.values.boolean.forEach((booleanValue: any) => {
          transformedValues.push({
            name: booleanValue.name,
            type: 'booleanValue',
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

      if (node.parameters.keepOnlySet = true) {
        // If "keepOnlySet" is true, add "include: none"
        node.parameters.include = "none";
        delete node.parameters.keepOnlySet;
      }
      break;
  }
}

export function modifyIntervalNode(node: INode): void {
  node.type = 'n8n-nodes-base.scheduleTrigger';
  node.typeVersion = 1.1;

  const intervalField = node.parameters.unit
    ? `${node.parameters.unit}Interval`
    : 'secondsInterval';

  node.parameters = {
    rule: {
      interval: [
        {
          field: node.parameters.unit || 'seconds',
          [intervalField]: node.parameters.interval
        }
      ]
    }
  };
}
