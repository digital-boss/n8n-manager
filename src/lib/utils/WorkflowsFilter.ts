import equal from 'fast-deep-equal';

export class WorkflowsFilter {
  name: string[] = [];
  id: number[] = [];
  tag: string[] = [];
  exclude: {
    id: number[];
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

}