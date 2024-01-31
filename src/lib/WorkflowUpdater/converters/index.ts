import { dateTimeNodeConv } from './dateTimeNode';
import { setNodeConv } from './setNode'
import { startNodeConv } from './startNode';
import { intervalNodeConv } from './intervalNode';
import { itemListsNodeConv } from './itemListsNode';
import { functionItemNodeConv } from './functionItemNode';
import { functionNodeConv } from './functionNode';
import { mergeNodeConv } from './mergeNode';
import { httpRequestNodeConv } from './httpRequestNode';
import { ifNodeConv } from './ifNode';
import { switchNodeConv } from './switchNode';

export const converters = [
  ...dateTimeNodeConv,
  ...setNodeConv,
  ...startNodeConv,
  ...intervalNodeConv,
  ...itemListsNodeConv,
  ...functionItemNodeConv,
  ...functionNodeConv,
  ...mergeNodeConv,
  ...httpRequestNodeConv,
  ...ifNodeConv,
  ...switchNodeConv,
];