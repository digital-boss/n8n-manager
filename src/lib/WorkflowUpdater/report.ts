import type { WorkflowChange, TodoItem, ChangesReport } from './types';

/**
 * 
 * @param workflows 
 * @returns string[]
 * This function returns information regarding the updated workflows to the user
 */
function getChanges(workflows: WorkflowChange[]): string[] {
  let reportContent: string[] = [];

  workflows.forEach((workflowChanges: WorkflowChange, index: number) => {
    const workflowName = workflowChanges.workflowName;
    reportContent.concat([
      `${index + 1}. ${workflowName.replace(/_/g, ' ').replace('.json', '')}\n`,
      '- Modified node names:',
    ]);
    workflowChanges.nodeNames.forEach((nodeName: string) => {
      reportContent.push(`    - ${nodeName}`);
    });
  });

  return reportContent;
}

/**
 * 
 * @param todos 
 * @returns string[]
 * This function returns information of the ToDos that should be manually reviewed by the user
 */
function getTodos(todos: TodoItem[]): string[] {
  let reportContent: string[] = [];

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
    reportContent.push(`${index + 1}. ${workflowName}`);
    const nodeTypes = groupedTodos[workflowName];
    Object.keys(nodeTypes).forEach((nodeType) => {
      reportContent.push(`  - Node names`);
      nodeTypes[nodeType].forEach((node: TodoItem) => {
        reportContent.push(`    - [${node.nodeType}] ${node.todo}`);
      });
    });
  });

  return reportContent;
}

/**
 * 
 * @param changesReport 
 * @returns string[]
 * This function returns information regarding the updated workflows to the user
 */
export function generateChangesReport(changesReport: ChangesReport): string[] {
  let reportContent = ['# Changes Report\n'];
  const workflows = changesReport.changes || [];
  reportContent.concat(getChanges(workflows));

  const todos = changesReport.todos || [];

  if (todos.length > 0) {
    reportContent.concat([
        '## TODO\n',
        `Activate the "Webhook Testing HTTP Node" workflow to test the Http Request node`,
        `Check and test all nodes manually in the workflows:`
      ]);

    reportContent.concat(getTodos(todos));
  }

  return reportContent;
}
