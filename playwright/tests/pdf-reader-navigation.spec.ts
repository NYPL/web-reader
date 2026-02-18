import { expect, test } from '@playwright/test';
import { PdfReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test navigation in PDF pub', () => {
  test('Displays reader navigation in PDF pub', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.firstChapter).toBeVisible();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
  });

  test('Click next/previous buttons', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
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

  test('Page input navigates to page', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(pdfReaderPage.pageInput).toBeVisible();
    await pdfReaderPage.pageInput.fill('2');
    await pdfReaderPage.pageInput.press('Enter');
    await expect(pdfReaderPage.pageTwo).toBeVisible();
  });

  test('Scroll to the bottom of the page', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await pdfReaderPage.scrollDown();
  });

  test('Scroll to the top of the page', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await pdfReaderPage.scrollUp();
  });

  test('Navigate reader in full screen', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
    await pdfReaderPage.fullScreenButton.click();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Navigate reader with changed screen size', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await pdfReaderPage.changeScreenSize();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Navigate reader while zoomed in', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await pdfReaderPage.zoomIn();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Navigate reader while zoomed out', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await pdfReaderPage.zoomOut();
    await pdfReaderPage.navigateReader();
    await expect(pdfReaderPage.pageOne).toBeVisible();
  });

  test('Use table of contents', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.firstChapter).toBeVisible();
    await pdfReaderPage.firstChapter.click();
    await expect(pdfReaderPage.firstIndexPage).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
    await pdfReaderPage.lastChapter.click();
    await expect(pdfReaderPage.lastIndexPage).toBeVisible();
  });
});
