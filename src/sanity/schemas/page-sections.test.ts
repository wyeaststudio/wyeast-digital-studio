// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { defineConfig, resolveConfig, validateDocument, type Workspace } from 'sanity';
import { createClient } from 'next-sanity';
import { of } from 'rxjs';
import { schemaTypes } from './index';

let workspace: Workspace;
let unsubscribe: () => void;

beforeAll(async () => {
  const workspaces = await new Promise<Workspace[]>((resolve, reject) => {
    const subscription = resolveConfig(
      defineConfig({
        projectId: 'test1234',
        dataset: 'production',
        auth: {
          state: of({
            authenticated: false,
            currentUser: null,
            client: createClient({ projectId: 'test1234', dataset: 'production', apiVersion: '2026-07-05', useCdn: false }),
          }),
        },
        schema: { types: schemaTypes },
      }),
    ).subscribe({ next: resolve, error: reject });
    unsubscribe = () => subscription.unsubscribe();
  });
  workspace = workspaces[0];
});

afterAll(() => unsubscribe());

const hero = {
  _key: 'hero',
  _type: 'heroSection',
  heading: 'A clear heading',
  image: {
    _type: 'image',
    asset: { _type: 'reference', _ref: 'image-e751ff451df3239abf8b15e64e6168c3182a0624-2400x1350-jpg' },
    decorative: true,
  },
};

const prose = {
  _key: 'prose',
  _type: 'richTextSection',
  body: [{
    _key: 'paragraph',
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _key: 'text', _type: 'span', text: 'Supporting content.', marks: [] }],
  }],
};

async function sectionErrors(type: string, sections: unknown[]) {
  const markers = await validateDocument({
    document: {
      _id: `test-${type}`,
      _type: type,
      _rev: 'test',
      _createdAt: '2026-11-18T00:00:00Z',
      _updatedAt: '2026-11-18T00:00:00Z',
      title: 'Test page',
      sections,
    },
    workspace,
    getDocumentExists: async () => true,
  });
  return markers.filter((marker) => marker.level === 'error' && marker.path[0] === 'sections');
}

describe.each(['homePage', 'page'])('%s section field validation [PB-R9, PB-R11]', (type) => {
  it('accepts a single first hero with distinct section anchors', async () => {
    const sections = [
      { ...hero, anchor: 'intro' },
      { ...prose, anchor: 'details' },
    ];
    expect(await sectionErrors(type, sections)).toEqual([]);
  });

  it('rejects repeated heroes through the compiled document schema', async () => {
    const errors = await sectionErrors(type, [hero, { ...hero, _key: 'second-hero' }]);
    expect(errors.map((error) => error.message)).toContain('A hero can only appear once, as the first section.');
  });

  it('rejects a hero after another section', async () => {
    const errors = await sectionErrors(type, [prose, hero]);
    expect(errors.map((error) => error.message)).toContain('A hero can only appear once, as the first section.');
  });

  it('rejects duplicate anchors through the compiled document schema', async () => {
    const sections = [
      { ...hero, anchor: 'same' },
      { ...prose, anchor: 'same' },
    ];
    const errors = await sectionErrors(type, sections);
    expect(errors.some((error) => error.message.includes('anchor must be unique'))).toBe(true);
  });
});
