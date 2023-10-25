interface IWorkflowTag {
  id: number;
  name: string;
}

export interface IWorkflow {
  updatedAt: string;
  id: string;
  name: string;
  active: boolean;
  tags: IWorkflowTag[];
}

export interface INode {
  parameters: Record<string, any>;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  id: string;
}

export interface TodoItem {
  workflow: string;
  node: string;
  additionalText: string;
}