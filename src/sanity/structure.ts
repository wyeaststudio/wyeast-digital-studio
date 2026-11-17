import type { StructureResolver } from 'sanity/structure';
import { singletonTypes, SINGLETON_TYPES } from './schemas/singletons';

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
      ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.has(item.getId() ?? '')),
    ]);
