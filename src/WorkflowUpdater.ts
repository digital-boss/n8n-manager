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

  let workflowData;

  try {
    workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (parseError) {
    console.error(`Error reading file ${file}:`, parseError);
    return;
  }

  const nodes = workflowData.nodes;
  const workflowName = file.replace(/\.json$/, '');

  const modifiedNodes = transform(converters, nodes);
  updateChangesReport(modifiedNodes, workflowName, changesReport);

  const updatedFilePath = path.join(outputDir, file);
  fs.writeFileSync(updatedFilePath, JSON.stringify(workflowData, null, 2));

  console.log(`File updated and saved to updatedNodes folder: ${file}`);
}

function updateChangesReport(modifiedNodes: any[], workflowName: string, changesReport: ChangesReport) {
  modifiedNodes.forEach((modifiedNode) => {
    updateChanges(changesReport, modifiedNode, workflowName);
    addTodoItem(changesReport, modifiedNode, workflowName);
  });
}

function updateChanges(changesReport: ChangesReport, modifiedNode: any, workflowName: string) {
  const existingChange = changesReport.changes.find((change) => change.workflowName === workflowName);
  if (existingChange) {
    existingChange.nodeNames.push(modifiedNode.nodeName);
  } else {
    changesReport.changes.push({ workflowName: workflowName, nodeNames: [modifiedNode.nodeName] });
  }
}

function addTodoItem(changesReport: ChangesReport, modifiedNode: any, workflowName: string) {
  if (modifiedNode.result !== "") {
    const todoItem: TodoItem = {
      workflow: workflowName,
      nodeName: modifiedNode.nodeName,
      result: modifiedNode.result,
      nodeType: modifiedNode.nodeType,
    };
    changesReport.todos.push(todoItem);
  }
}
