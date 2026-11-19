import { defineType } from 'sanity';
import { ICON_NAMES } from '../icon-names';

export const iconName = defineType({
  name: 'iconName',
  title: 'Icon',
  type: 'string',
  options: { list: [...ICON_NAMES] },
  validation: (rule) =>
    rule.required().custom((value) =>
      value === undefined || ICON_NAMES.some((name) => name === value) ? true : 'Choose an icon from the list.',
    ),
});
