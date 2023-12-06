const fs = require('fs');
const path = require('path');

import { converters } from "src/WorkflowUpdater/converters";
import { TodoItem } from "./WorkflowUpdater/types";
import { transform } from "./WorkflowUpdater/index";
import { generateChangesReport } from "./WorkflowUpdater/report";

export function updateWorkflows(dir: string, outputDir: string) {
  const workflowsDir = dir;
  const updatedNodesDir = outputDir;

  // Check if the "updatedNodes" folder exists, and if not, create it
  if (!fs.existsSync(updatedNodesDir)) {
    fs.mkdirSync(updatedNodesDir);
  }

  const changesReport = {
    changes: [] as { workflowName: string; nodeNames: string[] }[],
    todos: [] as { workflow: string; nodes: TodoItem[] }[],
  };

  fs.readdir(workflowsDir, (err: any, files: any[]) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(workflowsDir, file);

      if (fs.existsSync(filePath)) {
        try {
          const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const nodes = workflowData.nodes;
          const workflowName = file.replace(/\.json$/, '');

          const modifiedNodes = transform(converters, nodes);

          modifiedNodes.forEach((modifiedNode) => {
            const existingChange = changesReport.changes.find((change) => change.workflowName === workflowName);
            if (existingChange) {
              existingChange.nodeNames.push(modifiedNode.nodeName);
            } else {
              changesReport.changes.push({ workflowName: workflowName, nodeNames: [modifiedNode.nodeName] });
            }

            // If the modified node has additionalText, add it to the TODO list
            if (modifiedNode.additionalText !== "") {
              const todoItem: TodoItem = {
                workflow: workflowName,
                node: modifiedNode.nodeName,
                additionalText: modifiedNode.additionalText,
                nodeType: modifiedNode.type,
              };
              const existingTodo = changesReport.todos.find((todo) => todo.workflow === workflowName);
              if (existingTodo) {
                existingTodo.nodes.push(todoItem);
              } else {
                changesReport.todos.push({ workflow: workflowName, nodes: [todoItem] });
              }
            }

          });

          const updatedFilePath = path.join(updatedNodesDir, file);
          fs.writeFileSync(updatedFilePath, JSON.stringify(workflowData, null, 2));

          console.log(`File updated and saved to updatedNodes folder: ${file}`);
        } catch (parseError) {
          console.error(`Error processing file ${file}:`, parseError);
        }
        const changesReportFilePath = path.join(updatedNodesDir, 'ChangesReport.md');
        generateChangesReport(changesReport, changesReportFilePath);
      } else {
        console.error('File does not exist:', filePath);
      }
    });
  });
}
