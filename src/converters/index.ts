import { dateTimeNodeConv } from './dateTimeNode';
import { setNodeConv } from './setNode'

export const converters = [
  ...dateTimeNodeConv,
  ...setNodeConv
];