interface IWorkflowTag {
  id: string;
  name: string;
}

export interface IWorkflow {
  updatedAt: string;
  id: string;
  name: string;
  active: boolean;
  tags: IWorkflowTag[];
}