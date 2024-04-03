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
  nodeName: string;
  result?: string;
}

export interface ChangesReport {
  changes: WorkflowChange[];
  todos: TodoItem[];
}

export interface IConverter {
  predicate: (node: INode) => boolean;
  convert: (node: INode) => string; // ToDo: Let's move strings combining loginc outside the converters. Make return type string[].
}

export interface ConvertionResult {
  nodeType: string;
  nodeName: string;
  result?: string;
}
