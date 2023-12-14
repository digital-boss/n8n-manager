import fs from 'node:fs';
import path from 'node:path';

import { converters } from "src/lib/WorkflowUpdater/converters";
import { ChangesReport, TodoItem } from "./lib/WorkflowUpdater/types";
import { transform } from "./lib/WorkflowUpdater/index";
import { generateChangesReport } from "./lib/WorkflowUpdater/report";

export function updateWorkflows(dir: string, outputDir: string) {

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const changesReport: ChangesReport = {
    changes: [],
    todos: []
  };

  const files = fs.readdirSync(dir);

  files.forEach((file: string) => {
    const filePath = path.join(dir, file);

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

        const updatedFilePath = path.join(outputDir, file);
        fs.writeFileSync(updatedFilePath, JSON.stringify(workflowData, null, 2));

        console.log(`File updated and saved to updatedNodes folder: ${file}`);
      } catch (parseError) {
        console.error(`Error processing file ${file}:`, parseError);
      }
      const changesReportFilePath = path.join(outputDir, 'ChangesReport.md');
      generateChangesReport(changesReport, changesReportFilePath);
    } else {
      console.error('File does not exist:', filePath);
    }
  });
}
