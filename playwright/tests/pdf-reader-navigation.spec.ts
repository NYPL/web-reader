import { test, expect } from '@playwright/test';
import { PdfReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test navigation in PDF pub', () => {
  test('Displays reader navigation in PDF pub', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.backButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.firstChapter).toBeVisible();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
  });

  test('Click next/previous buttons on first page in paginated mode', async ({
    page,
  }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeDisabled();
    await pdfReaderPage.nextPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.pageTwo).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await pdfReaderPage.previousPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.pageOne).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on first page in scrolling mode', async ({
    page,
  }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.settingsButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.scrollingMode).toBeVisible();
    await pdfReaderPage.scrollingMode.click();
    await expect(pdfReaderPage.scrollingMode).toBeChecked();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeDisabled();
    await pdfReaderPage.nextPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.pageTwo).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await pdfReaderPage.previousPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.pageOne).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on last page in paginated mode', async ({
    page,
  }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
    await pdfReaderPage.lastChapter.click();
    await pdfReaderPage.loadPage();
    let i = 0;
    for (i = 0; i < 9; i++) {
      if (await pdfReaderPage.nextPageButton.isEnabled()) {
        await expect(pdfReaderPage.nextPageButton).toBeVisible();
        await expect(pdfReaderPage.nextPageButton).toBeEnabled();
        await pdfReaderPage.nextPageButton.click();
        await pdfReaderPage.loadPage();
      } else {
        break;
      }
    }
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeDisabled();
    await pdfReaderPage.previousPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await pdfReaderPage.nextPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeDisabled();
  });

  test('Click next/previous buttons on last page in scrolling mode', async ({
    page,
  }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.settingsButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.scrollingMode).toBeVisible();
    await pdfReaderPage.scrollingMode.click();
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
    await pdfReaderPage.lastChapter.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeDisabled();
    await pdfReaderPage.previousPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeEnabled();
    await pdfReaderPage.nextPageButton.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeEnabled();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeDisabled();
  });

  test('Scroll to the bottom of the page', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.settingsButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.scrollingMode).toBeVisible();
    await pdfReaderPage.scrollingMode.click();
    await expect(pdfReaderPage.scrollingMode).toBeChecked();
    await pdfReaderPage.scrollDown();
  });

  test('Scroll to the top of the page', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.settingsButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.scrollingMode).toBeVisible();
    await pdfReaderPage.scrollingMode.click();
    await expect(pdfReaderPage.scrollingMode).toBeChecked();
    await pdfReaderPage.scrollUp();
  });

  test('Navigate reader in full screen', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
    await pdfReaderPage.fullScreenButton.click();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Navigate reader with changed screen size', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.changeScreenSize();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Navigate reader while zoomed in', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.zoomIn();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Navigate reader while zoomed out', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.zoomOut();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Use table of contents in paginated mode', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
    await pdfReaderPage.lastChapter.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.pageTwo).toBeVisible();
  });

  test('Use table of contents in scrolling mode', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.settingsButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.scrollingMode).toBeVisible();
    await pdfReaderPage.scrollingMode.click();
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
    await pdfReaderPage.lastChapter.click();
    await pdfReaderPage.loadPage();
    await expect(pdfReaderPage.pageTwo).toBeVisible();
  });
});
