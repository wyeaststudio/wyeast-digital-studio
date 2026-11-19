import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations } from './helpers/axe';

const MISSING = '/this-does-not-exist';

/** WebKit only tabs to links with Alt+Tab. */
const tab = (page: Page, browserName: string) => page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');

const header = (page: Page) => page.locator('header.site-header');

async function headerIsVisible(page: Page) {
  const box = await header(page).boundingBox();
  return !!box && box.y + box.height > 0;
}

/** Makes the page tall enough to scroll regardless of content, after hydration attaches the scroll listener. */
async function makeScrollable(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.getElementById('main-content')!.style.setProperty('min-height', '4000px'));
}

test.describe('Landmarks and skip link [SHELL-R1, SHELL-R2]', () => {
  for (const path of ['/', MISSING]) {
    test(`${path} has one banner, main, and contentinfo`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
    });
  }

  test('the skip link is the first focusable element and moves focus to main', async ({ page, browserName }) => {
    await page.goto('/');
    await tab(page, browserName);
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });
});

test.describe('Desktop header [SHELL-R4..R7]', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop navigation');

  test('marks the current page and shows a 44px CTA', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    const box = await page.getByRole('banner').getByRole('link', { name: 'Book Appointment' }).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('the Services submenu opens with the keyboard and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const services = page.getByRole('button', { name: 'Services' });
    await services.focus();
    await page.keyboard.press('Enter');
    await expect(services).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Services overview' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(services).toHaveAttribute('aria-expanded', 'false');
    await expect(services).toBeFocused();
  });
});

test.describe('Header visibility [SHELL-R8, SHELL-R9]', () => {
  test('hides on scroll down, shows on scroll up', async ({ page }) => {
    await page.goto('/');
    await makeScrollable(page);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(header(page)).toHaveAttribute('data-hidden', 'true');
    await expect.poll(() => headerIsVisible(page)).toBe(false);

    await page.evaluate(() => window.scrollTo(0, 550));
    await expect(header(page)).toHaveAttribute('data-hidden', 'false');
    await expect.poll(() => headerIsVisible(page)).toBe(true);
  });

  test('shows again when focus moves into the hidden header', async ({ page }) => {
    await page.goto('/');
    await makeScrollable(page);
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect.poll(() => headerIsVisible(page)).toBe(false);

    await page.getByRole('link', { name: /, home$/ }).first().focus();
    await expect.poll(() => headerIsVisible(page)).toBe(true);
  });

  test('an element scrolled back into view by focus is not hidden behind the header', async ({ page }) => {
    await page.goto('/');
    await makeScrollable(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const target = page.locator('main > section').first().getByRole('link', { name: 'Booking details coming soon', exact: true });
    await target.focus();

    await expect.poll(() => headerIsVisible(page)).toBe(true);
    const headerBox = await header(page).boundingBox();
    const targetBox = await target.boundingBox();
    expect(targetBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
  });
});

test.describe('Mobile menu [SHELL-R13..R16]', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile navigation');

  const openMenu = (page: Page) => page.getByRole('button', { name: 'Open menu' });

  test('replaces the inline nav with a 44px menu button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner').getByRole('navigation', { name: 'Main' })).toBeHidden();
    const box = await openMenu(page).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('opens a modal dialog that traps focus', async ({ page }) => {
    await page.goto('/');
    await openMenu(page).click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    const focusInDialog = () => dialog.evaluate((el) => el.contains(document.activeElement));
    await expect.poll(focusInDialog).toBe(true);

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      // Wrapping passes through a focus guard beside the popup, which immediately moves focus back inside.
      await expect.poll(focusInDialog, { timeout: 1000 }).toBe(true);
    }
  });

  for (const [name, close] of [
    ['Escape', (page: Page) => page.keyboard.press('Escape')],
    ['"Close menu"', (page: Page) => page.getByRole('button', { name: 'Close menu' }).click()],
    ['the backdrop', (page: Page) => page.mouse.click(10, 400)],
  ] as const) {
    test(`closes with ${name} and returns focus to the menu button`, async ({ page }) => {
      await page.goto('/');
      await openMenu(page).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await close(page);
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(openMenu(page)).toBeFocused();
    });
  }

  test('closes after following a link', async ({ page }) => {
    await page.goto('/');
    await openMenu(page).click();
    await page.getByRole('dialog').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('opens without a sliding transition under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await openMenu(page).click();
    const duration = await page
      .getByRole('dialog')
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(duration).toBeLessThan(0.001);
  });
});

test.describe('404 page [SHELL-R24]', () => {
  test('returns 404 with a noindex "Page not found" page', async ({ page }) => {
    const response = await page.goto(MISSING);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
    await expect(page.getByRole('main').getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    const robots = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((el) => el.getAttribute('content')));
    expect(robots.some((content) => content?.includes('noindex'))).toBe(true);
  });
});

test.describe('Accessibility of the shell [SHELL-R19, FOUND-R18]', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`404 page has no violations (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(MISSING);
      await expectNoA11yViolations(page);
    });

    test(`open menus have no violations (${colorScheme})`, async ({ page, isMobile }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto('/');
      if (isMobile) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
      } else {
        await page.getByRole('button', { name: 'Services' }).click();
        await expect(page.getByRole('link', { name: 'Services overview' })).toBeVisible();
      }
      await expectNoA11yViolations(page);
    });
  }
});
