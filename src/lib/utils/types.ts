export interface INode {
  credentials: any;
  parameters: Record<string, any>;
  name: string;
  type: string;
  typeVersion: number;
  id: string;
}

export interface WorkflowChange {
  workflowName: string;
  nodeNames: string[];
}

export interface TodoItem {
  nodeType: string;
  workflow: string;
  node: string;
  additionalText?: string;
}

export interface ChangesReport {
  changes: WorkflowChange[];
  todos: { workflow: string; nodes: TodoItem[] }[];
}

export interface IConverter {
  predicate: (node: INode) => boolean;
  convert: (node: INode) => string;
}

export interface ChangedNodeInformation {
  type: string;
  nodeName: string;
  additionalText?: string;
}