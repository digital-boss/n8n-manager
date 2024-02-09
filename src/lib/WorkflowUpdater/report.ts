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

function generateTodos(todos: { workflow: string; nodes: TodoItem[] }[], workflowChanges: WorkflowChange[]): string {
  let reportContent = '';

  todos.forEach((todo: { workflow: string; nodes: TodoItem[] }, index: number) => {
    const workflowName = todo.workflow;
    const matchingWorkflowChanges = workflowChanges.find(
      (workflow: WorkflowChange) => workflow.workflowName === workflowName
    );

    if (matchingWorkflowChanges) {
      const nodesRequiringAttention = todo.nodes.filter((node: TodoItem) => {
        const matchingNode = matchingWorkflowChanges.nodeNames.find((nodeName: string) => nodeName === node.nodeName);
        const result = node.result ?? '';

        // Include nodes that require attention and don't contain success message
        return matchingNode && !result.includes('Successfully updated');
      });

      if (nodesRequiringAttention.length > 0) {
        // Include only workflows that have nodes requiring attention
        reportContent += ` ${index + 1}. ${workflowName.replace(/_/g, ' ').replace('.json', '')}\n`;
        reportContent += '  - Node names:\n';

        nodesRequiringAttention.forEach((node: TodoItem) => {
          const result = node.result ?? '';

          reportContent += `    - [${node.nodeType}] ${node.result}\n`;
        });

        reportContent += '\n';
      }
    }
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
    
    reportContent += generateTodos(todos, workflows);
  }

  fs.writeFile(filePath, reportContent, (err) => {
    if (err) {
      console.error('Error writing changes report file:', err);
    } else {
      console.log('Changes report generated and saved:', filePath);
    }
  });
}
