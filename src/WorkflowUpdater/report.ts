import fs from "node:fs";

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
    fs.writeFile(filePath, reportContent, (err: any) => {
      if (err) {
        console.error('Error writing changes report file:', err);
      } else {
        console.log('Changes report generated and saved:', filePath);
      }
    });
  }