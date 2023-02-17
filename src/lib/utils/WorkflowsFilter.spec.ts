import { WorkflowsFilter } from './WorkflowsFilter';

describe('WorkflowsFilter', () => {
  describe('isEmpty', () => {
  
    test('isEmpty should return true on new WorkflowsFilter', () => {
      const f1 = new WorkflowsFilter();
      expect(f1.isEmpty()).toEqual(true);
    });

    test('isEmpty should return false, if there is at least one parameter', () => {
      const f1 = WorkflowsFilter.create(i => i.exclude.id = [1]);
      expect(f1.isEmpty()).toEqual(false);
    });
  })
});