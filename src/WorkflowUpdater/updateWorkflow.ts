import fs from "node:fs";
import path from "node:path";

import {
  modifyHttpRequestNode,
  modifySetNode,
  modifyDateTimeNode,
  modifyMergeNode,
  modifyIntervalNode,
  generateChangesReport,
  modifyItemListsNode,
} from './helperFunctions';

// Import the INode interface
import { INode, TodoItem } from "src/lib/utils/Workflow";

// Define the expected versions based on node type
const expectedVersions: { [nodeType: string]: number } = {
  'n8n-nodes-base.set': 2,
  'n8n-nodes-base.itemLists': 3,
  'n8n-nodes-base.interval': 1.1,
  'n8n-nodes-base.functionItem': 2,
  'n8n-nodes-base.function': 2,
  'n8n-nodes-base.httpRequest': 4.1,
  'n8n-nodes-base.dateTime': 2,
  'n8n-nodes-base.merge': 2.1,
};

export function updateWorkflows(dir: string) {
  const oldNodesDirectoryPath = dir;
  const updatedNodesDirectoryPath = '././tests/updatedWorkflows'; // TODO: Update with the path of the folder to store updated files

  // Check if the "updatedNodes" folder exists, and if not, create it
  if (!fs.existsSync(updatedNodesDirectoryPath)) {
    fs.mkdirSync(updatedNodesDirectoryPath);
  }

  const changesReport = {
    changes: [] as { workflowName: string; nodeNames: string[] }[], // Initialize changes as an empty array with a specified type
    todos: [] as { workflow: string; nodes: TodoItem[] }[], // Initialize todos as an empty array with a specified type
  };

  fs.readdir(oldNodesDirectoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    let processedCount = 0; // Counter to track processed workflows
    const totalWorkflows = files.length; // Total number of workflows

    files.forEach((file) => {
      const filePath = path.join(oldNodesDirectoryPath, file);

      // Check if the file exists before reading it
      if (fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }

          try {
            const jsonData: any = JSON.parse(data); // Use 'any' type here
            const workflowName = file.replace(/Node\.json$/, ''); // Extract workflow name

            const workflowChanges = {
              workflowName: workflowName,
              nodeNames: [] as string[], // Initialize an empty array with a specified type
            };
            const todoNodes: TodoItem[] = []; // Initialize an array with a specified type to store nodes for the TODO list

            // Modify the necessary fields in the JSON data
            jsonData.nodes.forEach((node: INode) => {
              let nodeModified = false;

              const expectedLatestVersion = expectedVersions[node.type];

              if (expectedLatestVersion && node.typeVersion !== 1 && node.typeVersion !== expectedLatestVersion) {
                // Add the node to the TODO list with specific text
                const additionalText = `The node needs to be manually updated to version ${expectedLatestVersion}.`;
                todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                if (!workflowChanges.nodeNames.includes(node.name)) {
                  nodeModified = true;
                }
              } else {
                switch (node.type) {
                  case 'n8n-nodes-base.start':
                    node.type = 'n8n-nodes-base.manualTrigger';
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                    }
                    break;
                  case 'n8n-nodes-base.set':
                    modifySetNode(node);
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                    }
                    break;
                  case 'n8n-nodes-base.itemLists':
                    modifyItemListsNode(node);
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                    }
                    if (node.parameters.operation == 'summarize') {
                      // Add the itemLists node to the TODO list with specific text
                      const additionalText =
                        'Operation "Summarize" change is substituting dots (".") with underscores ("_") in the field name, such as "test.name" in the new version is "test_name"';
                      todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                    }
                    break;
                  case 'n8n-nodes-base.interval':
                    modifyIntervalNode(node);
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                    }
                    break;
                  case 'n8n-nodes-base.functionItem':
                    node.type = 'n8n-nodes-base.code';
                    node.typeVersion = 2;
                    node.parameters.mode = 'runOnceForEachItem';
                    // Rename functionCode to jsCode and replace "item" with "item.json"
                    node.parameters.jsCode = node.parameters.functionCode.replace(/\bitem\b/g, 'item.json');
                    delete node.parameters.functionCode; // Remove old field
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                      // Add the function node to the TODO list with specific text
                      const additionalText =
                        'The node needs to be tested manually. Check the access to the input data and the returned format.';
                      todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                    }
                    break;
                  case 'n8n-nodes-base.function':
                    node.type = 'n8n-nodes-base.code';
                    node.typeVersion = 2;
                    node.parameters.jsCode = node.parameters.functionCode; // Rename functionCode to jsCode
                    delete node.parameters.functionCode; // Remove old field
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                      // Add the function node to the TODO list with specific text
                      const additionalText =
                        'The node needs to be tested manually. Check the access to the input data and returned format.';
                      todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                    }
                    break;
                  case 'n8n-nodes-base.httpRequest':
                    if (node.parameters.options.splitIntoItems) {
                      // Add the itemLists node to the TODO list with specific text
                      const additionalText = 'In the new version of the HTTP node, the "splitIntoItems" options are no longer supported.';
                      todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                    }
                    modifyHttpRequestNode(node);
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                      if (node.parameters.method == 'OPTIONS') {
                        // Add the itemLists node to the TODO list with specific text
                        const additionalText =
                          'Request method "OPTIONS": you will need to manually check the response to ensure it is working as expected.';
                        todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                      }
                      if (node.parameters.method == 'HEAD') {
                        // Add the itemLists node to the TODO list with specific text
                        const additionalText =
                          'Request method "HEAD": you will need to manually check the response to ensure it is working as expected.';
                        todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                      }
                    }
                    break;
                  case 'n8n-nodes-base.dateTime':
                    modifyDateTimeNode(node);
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                    }
                    if (node.parameters.operation == 'subtractFromDate') {
                      // Add the dateTime node to the TODO list with specific text
                      const additionalText = '"Subtract" operation returns +2:00 time zone offset.';
                      todoNodes.push({ workflow: workflowName, node: node.name, additionalText });
                    }
                    break;
                  case 'n8n-nodes-base.merge':
                    modifyMergeNode(node);
                    if (!workflowChanges.nodeNames.includes(node.name)) {
                      nodeModified = true;
                    }
                    break;
                }
              }
              if (nodeModified) {
                workflowChanges.nodeNames.push(node.name);
              }
            });

            if (workflowChanges.nodeNames.length > 0) {
              changesReport.changes.push(workflowChanges);
            }

            if (todoNodes.length > 0) {
              changesReport.todos.push({ workflow: workflowName, nodes: todoNodes });
            }

            // Write the updated JSON to the "updatedNodes" folder
            const updatedFilePath = path.join(updatedNodesDirectoryPath, file);
            fs.writeFile(updatedFilePath, JSON.stringify(jsonData, null, 2), (err) => {
              if (err) {
                console.error('Error writing file:', err);
              } else {
                console.log(`File updated and saved to updatedNodes folder: ${file}`);
              }
            });
          } catch (parseError) {
            console.error('Error parsing JSON in file:', file, parseError);
          }

          processedCount++;

          if (processedCount === totalWorkflows) {
            // Generate the final report after processing all workflows
            const changesReportFilePath = path.join(updatedNodesDirectoryPath, 'ChangesReport.md');
            generateChangesReport(changesReport, changesReportFilePath);
          }
        });
      } else {
        console.error('File does not exist:', filePath);
        processedCount++;
      }
    });
  });
}
