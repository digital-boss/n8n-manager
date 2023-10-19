// helperFunctions.ts
import * as fs from 'fs';

export function modifyHttpRequestNode(node: any): void {
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
        default:
          break;
      }
    }

    node.parameters.options = updatedOptions;
  }

  node.parameters = { method, ...node.parameters };
}

export function modifyDateTimeNode(node: any): void {
  if (node.parameters.action === 'calculate') {
    // Set parameters for calculation
    node.parameters.operation = 'subtractFromDate';
    node.parameters.magnitude = node.parameters.value;
    node.parameters.outputFieldName = node.parameters.dataPropertyName;
    node.typeVersion = 2;
    delete node.parameters.dataPropertyName;
    delete node.parameters.options;
    delete node.parameters.action;
    delete node.parameters.value;
  } else {
    // Set parameters for formatting
    node.parameters.operation = 'formatDate';
    node.parameters.date = node.parameters.value;

    if (node.parameters.toFormat) {
      if (
        node.parameters.toFormat == 'YYYY/MM/DD' ||
        node.parameters.toFormat == 'MMMM DD YYYY' ||
        node.parameters.toFormat == 'MM-DD-YYYY' ||
        node.parameters.toFormat == 'YYYY-MM-DD'
      ) {
        node.parameters.format = node.parameters.toFormat
          .replace('YYYY', 'yyyy')
          .replace('DD', 'dd');
      } else {
        node.parameters.format = node.parameters.toFormat.replace('DD', 'dd');
      }
    }

    node.parameters.outputFieldName = node.parameters.dataPropertyName;
    node.typeVersion = 2;
    delete node.parameters.dataPropertyName;
    delete node.parameters.value;
    delete node.parameters.toFormat; // Remove the old property
  }
}

export function modifyMergeNode(node: any): void {
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
}

export function modifyItemListsNode(node: any): void {
  node.typeVersion = 3;

  if (node.parameters.operation === 'aggregateItems') {
    node.parameters.operation = 'concatenateItems';
    if (node.parameters.include === 'specifiedFields' && node.parameters.fieldsToInclude && node.parameters.fieldsToInclude.fields) {
      // Update 'fieldsToInclude' based on 'fieldsName'
      const fieldsToInclude = Array.isArray(node.parameters.fieldsToInclude.fields)
        ? node.parameters.fieldsToInclude.fields.map((field: any) => field.fieldName)
        : node.parameters.fieldsToInclude.fields;

      // Set 'fieldsToInclude' as a string if there's only one field
      node.parameters.fieldsToInclude = fieldsToInclude.length === 1 ? fieldsToInclude[0] : fieldsToInclude;

      // Remove the unnecessary 'fields' field
      delete node.parameters.fieldsToInclude.fields;
    } else if (node.parameters.include === 'allFieldsExcept' && node.parameters.fieldsToExclude && node.parameters.fieldsToExclude.fields) {
      // Update 'fieldsToExclude' based on 'fieldsName'
      const fieldsToExclude = Array.isArray(node.parameters.fieldsToExclude.fields)
        ? node.parameters.fieldsToExclude.fields.map((field: any) => field.fieldName)
        : node.parameters.fieldsToExclude.fields;

      // Set 'fieldsToExclude' as a string if there's only one field
      node.parameters.fieldsToExclude = fieldsToExclude.length === 1 ? fieldsToExclude[0] : fieldsToExclude;

      // Remove the unnecessary 'fields' field
      delete node.parameters.fieldsToExclude.fields;
    }
  } else if (node.parameters.operation === 'removeDuplicates') {
    // Update 'fieldsToCompare' based on 'fieldsName'
    if (node.parameters.fieldsToCompare && node.parameters.fieldsToCompare.fields) {
      const fieldsToCompare = Array.isArray(node.parameters.fieldsToCompare.fields)
        ? node.parameters.fieldsToCompare.fields.map((field: any) => field.fieldName)
        : node.parameters.fieldsToCompare.fields;

      // Set 'fieldsToCompare' as a string if there's only one field
      node.parameters.fieldsToCompare = fieldsToCompare.length === 1 ? fieldsToCompare[0] : fieldsToCompare;

      // Remove the unnecessary 'fields' field
      delete node.parameters.fieldsToCompare.fields;
    } else if (node.parameters.fieldsToExclude && node.parameters.fieldsToExclude.fields) {
      const fieldsToExclude = Array.isArray(node.parameters.fieldsToExclude.fields)
        ? node.parameters.fieldsToExclude.fields.map((field: any) => field.fieldName)
        : node.parameters.fieldsToExclude.fields;

      // Set 'fieldsToExclude' as a string if there's only one field
      node.parameters.fieldsToExclude = fieldsToExclude.length === 1 ? fieldsToExclude[0] : fieldsToExclude;

      // Remove the unnecessary 'fields' field
      delete node.parameters.fieldsToExclude.fields;
    }
  } else if (node.parameters.fieldToSplitOut && node.parameters.include === 'selectedOtherFields') {
    // Update 'fieldsToInclude' based on 'fieldsName'
    const fieldsToInclude = Array.isArray(node.parameters.fieldsToInclude.fields)
      ? node.parameters.fieldsToInclude.fields.map((field: any) => field.fieldName)
      : node.parameters.fieldsToInclude.fields;

    // Set 'fieldsToInclude' as a string if there's only one field
    node.parameters.fieldsToInclude = fieldsToInclude.length === 1 ? fieldsToInclude[0] : fieldsToInclude;

    // Remove the unnecessary 'fields' field
    delete node.parameters.fieldsToInclude.fields;
  }
}

export function modifySetNode(node: any): void {
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

export function modifyIntervalNode(node: any): void {
  if (node.parameters.mode === 'everyMinutes') {
    node.parameters.everyMinutes = node.parameters.minutes;
    delete node.parameters.minutes;
    delete node.parameters.interval;
    delete node.parameters.mode;
  } else {
    delete node.parameters.minutes;
    delete node.parameters.interval;
    delete node.parameters.mode;
  }
}

export function generateChangesReport(changesReport: any, filePath: string): void {
    let reportContent = '# Changes Report\n\n';

    const workflows = changesReport.changes || [];

    workflows.forEach((workflowChanges: any, index: number) => {
        const workflowName = workflowChanges.workflowName;
        reportContent += `${index + 1}. ${workflowName.replace(/_/g, ' ').replace(".json", "")}\n`;
        reportContent += '  - Modified node names:\n';
        workflowChanges.nodeNames.forEach((nodeName: string) => {
            reportContent += `    - ${nodeName}\n`;
        });
        reportContent += '\n';
    });

    const todos = changesReport.todos || [];

    if (todos.length > 0) {
        reportContent += '## TODO\n';
        reportContent += '\n';
        reportContent += `Activate the "Webhook Testing HTTP Node" workflow to test the Http Request node\n`;
        reportContent += `Check and test all nodes manually in the workflows:\n`;

        let workflowChanges: any;

        todos.forEach((todo: any, index: number) => {
            const workflowName = todo.workflow;
            reportContent += ` ${index + 1}. ${workflowName.replace(/_/g, ' ').replace(".json", "")}\n`;
            reportContent += '  - Node names:\n';

            workflowChanges = workflows.find(
                (workflow: any) => workflow.workflowName === workflowName
            );

            if (workflowChanges) {
                todo.nodes.forEach((node: any) => {
                    const matchingNode = workflowChanges.nodeNames.find((nodeName: string) => nodeName === node.node);

                    if (matchingNode) {
                        reportContent += `    - ${node.node}: ${node.additionalText}\n`;
                    }
                });
            }
            reportContent += '\n';
        });
    }
    fs.writeFile(filePath, reportContent, err => {
        if (err) {
            console.error('Error writing changes report file:', err);
        } else {
            console.log('Changes report generated and saved:', filePath);
        }
    });
}
