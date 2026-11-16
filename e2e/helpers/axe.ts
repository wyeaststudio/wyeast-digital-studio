import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const summary = results.violations.map((violation) => {
    const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ');
    return `- ${violation.id} (impact: ${violation.impact ?? 'unknown'}): ${targets}`;
  });

  expect(
    results.violations,
    `Accessibility violations found:\n${summary.join('\n')}`,
  ).toEqual([]);
}
