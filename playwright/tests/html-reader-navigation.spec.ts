import { test, expect } from '@playwright/test';
import { HtmlReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test navigation in HTML pub', () => {
  test('Displays reader navigation in HTML pub', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
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
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
    await htmlReaderPage.nextPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await htmlReaderPage.previousPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on first page in scrolling mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
    await htmlReaderPage.nextPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await htmlReaderPage.previousPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on last page in paginated mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.lastChapter).toBeVisible();
    await htmlReaderPage.lastChapter.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeDisabled();
    await htmlReaderPage.previousPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await htmlReaderPage.nextPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on last page in scrolling mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.lastChapter).toBeVisible();
    await htmlReaderPage.lastChapter.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeDisabled();
    await htmlReaderPage.previousPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await htmlReaderPage.nextPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeEnabled();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeDisabled();
  });

  test('Scroll to the bottom of the page', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.scrollingMode).toBeChecked();
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.chapterName).toBeVisible();
    await htmlReaderPage.chapterName.click();
    await htmlReaderPage.loadPage();
    await htmlReaderPage.scrollDown();
  });

  test('Scroll to the top of the page', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.scrollingMode).toBeChecked();
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.chapterName).toBeVisible();
    await htmlReaderPage.chapterName.click();
    await htmlReaderPage.loadPage();
    await htmlReaderPage.scrollUp();
  });

  test('Navigate reader in full screen', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
    await htmlReaderPage.fullScreenButton.click();
    await htmlReaderPage.navigateReader();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
  });

  test('Navigate reader with changed screen size', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await htmlReaderPage.changeScreenSize();
    await htmlReaderPage.navigateReader();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
  });

  test('Click internal link in paginated mode', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
    await htmlReaderPage.nextPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.internalLink).toBeVisible();
    await htmlReaderPage.internalLink.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.titlePage).toBeVisible();
  });

  test('Click internal link in scrolling mode', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.nextPageButton).toBeVisible();
    await expect(htmlReaderPage.nextPageButton).toBeEnabled();
    await expect(htmlReaderPage.previousPageButton).toBeVisible();
    await expect(htmlReaderPage.previousPageButton).toBeDisabled();
    await htmlReaderPage.nextPageButton.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.internalLink).toBeVisible();
    await htmlReaderPage.internalLink.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.titlePage).toBeVisible();
  });

  test('Click external link in paginated mode', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.lastChapter).toBeVisible();
    await htmlReaderPage.lastChapter.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.externalLink).toBeVisible();
    await htmlReaderPage.externalLink.click();
    const openLink = page.waitForEvent('popup');
    const newTab = await openLink;
    await newTab.waitForLoadState();
    await expect(newTab).toHaveURL('https://www.gutenberg.org');
  });

  test('Remember last location when exit and reenter reader', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.chapterName).toBeVisible();
    await htmlReaderPage.chapterName.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
    await expect(htmlReaderPage.backButton).toBeVisible();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
  });

  test('Remember last location when visit another remembering pub and reenter original pub', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.chapterName).toBeVisible();
    await htmlReaderPage.chapterName.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
    await expect(htmlReaderPage.backButton).toBeVisible();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPub('/html/moby-epub2');
    await expect(htmlReaderPage.epubCover).toBeVisible();
    await expect(htmlReaderPage.backButton).toBeVisible();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
  });

  test('Do not remember last location when exit and reenter reader in specific pub', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3-no-local-storage');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.chapterName).toBeVisible();
    await htmlReaderPage.chapterName.click();
    await htmlReaderPage.loadPage();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
    await expect(htmlReaderPage.backButton).toBeVisible();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPub('/html/moby-epub3-no-local-storage');
    await expect(htmlReaderPage.titlePage).toBeVisible();
    await expect(htmlReaderPage.chapterHeading).not.toBeVisible();
  });

  test('Confirm missing TOC in specific pub', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/test/missing-toc');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    const missingTOC = page.getByText(
      'This publication does not have a Table of Contents.'
    );
    await expect(missingTOC).toBeVisible();
  });
});
