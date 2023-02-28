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