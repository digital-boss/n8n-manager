export interface INode {
  credentials: any;
  parameters: Record<string, any>;
  name: string;
  type: string;
  typeVersion: number;
  id: string;
}

export interface TodoItem {
  workflow: string;
  node: string;
  nodeType: string;
  additionalText: string;
}

export interface IWorkflowUpdate {
  nodes: INode[];
}