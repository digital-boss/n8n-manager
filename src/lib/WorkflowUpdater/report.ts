import fs from 'node:fs';
import type { WorkflowChange, TodoItem, ChangesReport } from './types';

function generateChanges(workflows: WorkflowChange[]): string {
  let reportContent = '';

  workflows.forEach((workflowChanges: WorkflowChange, index: number) => {
    const workflowName = workflowChanges.workflowName;
    reportContent += `${index + 1}. ${workflowName.replace(/_/g, ' ').replace('.json', '')}\n`;
    reportContent += '  - Modified node names:\n';
    workflowChanges.nodeNames.forEach((nodeName: string) => {
      reportContent += `    - ${nodeName}\n`;
    });
    reportContent += '\n';
  });

  return reportContent;
}

function generateTodos(todos: TodoItem[]): string {
  let reportContent = '';

  const groupedTodos: { [workflowName: string]: { [nodeType: string]: TodoItem[] } } = {};
  todos.forEach((todo: TodoItem) => {
    if (!groupedTodos[todo.workflow]) {
      groupedTodos[todo.workflow] = {};
    }
    if (!groupedTodos[todo.workflow][todo.nodeType]) {
      groupedTodos[todo.workflow][todo.nodeType] = [];
    }
    groupedTodos[todo.workflow][todo.nodeType].push(todo);
  });

  // Generate report content
  Object.keys(groupedTodos).forEach((workflowName, index) => {
    reportContent += `${index + 1}. ${workflowName}\n`;
    const nodeTypes = groupedTodos[workflowName];
    Object.keys(nodeTypes).forEach((nodeType) => {
      reportContent += `  - Node names\n`;
      nodeTypes[nodeType].forEach((node: TodoItem) => {
        reportContent += `    - [${node.nodeType}] ${node.result}\n`;
      });
    });

    reportContent += '\n';
  });

  return reportContent;
}

export function generateChangesReport(changesReport: ChangesReport, filePath: string): void {
  let reportContent = '# Changes Report\n\n';
  const workflows = changesReport.changes || [];
  reportContent += generateChanges(workflows);

  const todos = changesReport.todos || [];

  if (todos.length > 0) {
    reportContent += '## TODO\n';
    reportContent += '\n';
    reportContent += `Activate the "Webhook Testing HTTP Node" workflow to test the Http Request node\n`;
    reportContent += `Check and test all nodes manually in the workflows:\n`;

    reportContent += generateTodos(todos);
  }

  fs.writeFile(filePath, reportContent, (err) => {
    if (err) {
      console.error('Error writing changes report file:', err);
    } else {
      console.log('Changes report generated and saved:', filePath);
    }
  });
}
