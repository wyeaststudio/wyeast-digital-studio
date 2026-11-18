import type { StructureResolver } from 'sanity/structure';
import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { singletonTypes, SINGLETON_TYPES } from './schemas/singletons';

const FAQ_TYPE = 'faq';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...singletonTypes.map((type) =>
        S.listItem()
          .title(type.title ?? type.name)
          .id(type.name)
          .icon(type.icon)
          .child(S.document().schemaType(type.name).documentId(type.name).title(type.title ?? type.name)),
      ),
      S.divider(),
      S.documentTypeListItem(FAQ_TYPE).title('FAQs').icon(HelpCircleIcon),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? '';
        return !SINGLETON_TYPES.has(id) && id !== FAQ_TYPE;
      }),
    ]);
