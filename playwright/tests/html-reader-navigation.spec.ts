import { test, expect } from '@playwright/test';
import { HtmlReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test navigation in HTML pub', () => {
  test('Displays reader navigation in HTML pub', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await expect(htmlReaderPage.backButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.firstChapter).toBeVisible();
    await expect(htmlReaderPage.lastChapter).toBeVisible();
  });

  test('Click next/previous buttons on first page in paginated mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await page.goto('/html/moby-epub3');
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
    await htmlReaderPage.nextPageButton.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await htmlReaderPage.previousPageButton.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on first page in scrolling mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await page.goto('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.scrollingStyle.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
    await htmlReaderPage.nextPageButton.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await htmlReaderPage.previousPageButton.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on last page in paginated mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await page.goto('/html/moby-epub3');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await htmlReaderPage.lastChapter.click();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeDisabled();
    await htmlReaderPage.previousPageButton.click();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await htmlReaderPage.nextPageButton.click();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeDisabled();
  });
});

// move scrolling here?
// scroll to the bottom of the page in scrolling mode
// scroll to the top of the page in scrolling mode

// change viewport
// scroll to the bottom of the page, but if the screen is resized to be smaller, vertical scroll bar should re-appear to allow user to scroll down
// small screen viewport 300x300 should disable next and previous buttons?

// click internal link in paginated mode
// click internal link in scrolling mode
// click external link

// remember last location when exit and reenter
// remember last location when visit another remembering pub and return
// do not remember last location in /html/moby-epub3-no-local-storage

// navigate in full screen

// missing TOC in /html/test/missing-toc
