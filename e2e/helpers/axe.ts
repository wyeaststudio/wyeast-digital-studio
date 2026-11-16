import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface A11yOptions {
  /** CSS selector to scope the scan to. */
  include?: string;
  /** Run only these axe rule IDs instead of the full WCAG tag set. */
  rules?: string[];
}

export async function expectNoA11yViolations(page: Page, { include, rules }: A11yOptions = {}) {
  let builder = new AxeBuilder({ page });
  builder = rules ? builder.withRules(rules) : builder.withTags(WCAG_TAGS);
  if (include) builder = builder.include(include);
  const results = await builder.analyze();

  const summary = results.violations.map((violation) => {
    const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ');
    return `- ${violation.id} (impact: ${violation.impact ?? 'unknown'}): ${targets}`;
  });

  expect(
    results.violations,
    `Accessibility violations found:\n${summary.join('\n')}`,
  ).toEqual([]);
}
