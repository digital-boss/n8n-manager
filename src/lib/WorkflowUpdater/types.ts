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
  todos: { workflow: string; nodes: TodoItem[] }[];
}

export interface IConverter {
  predicate: (node: INode) => boolean;
  convert: (node: INode) => string;
}

export interface ConvertionResult {
  nodeType: string;
  nodeName: string;
  result?: string;
}

export interface OperationMappings {
  [operationType: string]: {
    [operationName: string]: string;
    default: string;
  };
}

export interface Rule {
  outputKey: number;
  output: any;
}