import fs from 'node:fs';
import path from 'node:path';

import { converters } from "src/lib/WorkflowUpdater/converters";

import type { ChangesReport, TodoItem } from "./lib/WorkflowUpdater/types";
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
    processFile(dir, file, changesReport, outputDir);
  });

  const changesReportFilePath = path.join(outputDir, 'ChangesReport.md');
  generateChangesReport(changesReport, changesReportFilePath);
}

function processFile(dir: string, file: string, changesReport: ChangesReport, outputDir: string) {
  const filePath = path.join(dir, file);

  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }

  try {
    const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const nodes = workflowData.nodes;
    const workflowName = file.replace(/\.json$/, '');

    const modifiedNodes = transform(converters, nodes);
    updateChangesReport(modifiedNodes, workflowName, changesReport);

    const updatedFilePath = path.join(outputDir, file);
    fs.writeFileSync(updatedFilePath, JSON.stringify(workflowData, null, 2));

    console.log(`File updated and saved to updatedNodes folder: ${file}`);
  } catch (parseError) {
    console.error(`Error processing file ${file}:`, parseError);
  }
}

function updateChangesReport(modifiedNodes: any[], workflowName: string, changesReport: ChangesReport) {
  modifiedNodes.forEach((modifiedNode) => {
    const existingChange = changesReport.changes.find((change) => change.workflowName === workflowName);
    if (existingChange) {
      existingChange.nodeNames.push(modifiedNode.nodeName);
    } else {
      changesReport.changes.push({ workflowName: workflowName, nodeNames: [modifiedNode.nodeName] });
    }

    if (modifiedNode.todoMessage !== "") {
      const todoItem: TodoItem = {
        workflow: workflowName,
        nodeName: modifiedNode.nodeName,
        todoMessage: modifiedNode.todoMessage,
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
}
