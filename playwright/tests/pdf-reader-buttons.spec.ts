import { expect, test } from '@playwright/test';
import { PdfReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test settings in PDF pub', () => {
  test('Confirm reader settings are visible', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
    await expect(pdfReaderPage.zoomInButton).toBeVisible();
    await expect(pdfReaderPage.zoomOutButton).toBeVisible();
  });

  test('Zoom in', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(await pdfReaderPage.zoomIn()).toBeTruthy;
  });

  test('Zoom out', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(await pdfReaderPage.zoomOut()).toBeTruthy;
  });

  test('Open and exit full screen', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/single-resource-short');
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
    await pdfReaderPage.fullScreenButton.click();
    await expect(pdfReaderPage.exitFullScreenButton).toBeVisible();
    await pdfReaderPage.exitFullScreenButton.click();
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
  });
});
