import equal from 'fast-deep-equal';
import { IWorkflow } from './Workflow';

export class WorkflowsFilter {
  name: string[] = [];
  id: string[] = [];
  tag: string[] = [];
  exclude: {
    id: string[];
  } = {id:[]};

  static create(updateFn: (i: WorkflowsFilter) => void): WorkflowsFilter {
    const o = new WorkflowsFilter();
    updateFn(o);
    return o;
  }

  isEmpty () {
    return equal(this, new WorkflowsFilter());
  }

  hasIds () {
    return this.id && this.id.length;
  }

  hasNames () { 
    return this.name && this.name.length;
  }
  
  hasTags () {
    return this.tag && this.tag.length;
  }
  
  hasExcludedIds () {
    return this.exclude.id.length;
  }
  
  getIds () {
    return this.id.filter(i => !this.exclude.id.includes(i));
  }

  apply (source: IWorkflow[]): IWorkflow[] {
    let wfs = source;
    if (this.hasNames()) {
      wfs = wfs.filter(i => this.name.includes(i.name))
    }
    if (this.hasTags()) {
      wfs = wfs.filter(i => i.tags.findIndex(tag => this.tag.includes(tag.name)) > -1)
    }
    if (this.hasExcludedIds()) {
      wfs = wfs.filter(i => !this.exclude.id.includes(i.id))
    }
    return wfs;
  }

}