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
  const reportContent = generateChangesReport(changesReport).join('\n');
  fs.writeFile(changesReportFilePath, reportContent, (err) => {
    if (err) {
      console.error('Error writing changes report file:', err);
    } else {
      console.log('Changes report generated and saved:', changesReportFilePath);
    }
  });

}

function loadWorkflowFromFile(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(content);
  } catch (parseError) {
    throw new Error(`Error parsing file ${filePath}`);
  }
}

function processFile(dir: string, file: string, changesReport: ChangesReport, outputDir: string) {
  const filePath = path.join(dir, file);

  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }

  const workflowData = loadWorkflowFromFile(filePath);

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
