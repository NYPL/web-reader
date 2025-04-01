import { test, expect } from '@playwright/test';
import { PdfReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test PDF pub', () => {
  test('Confirm reader settings are visible', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.settingsButton).toBeVisible();
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.zoomInButton).toBeVisible();
    await expect(pdfReaderPage.zoomOutButton).toBeVisible();
    await expect(pdfReaderPage.paginatedMode).toBeVisible();
    await expect(pdfReaderPage.scrollingMode).toBeVisible();
  });

  test('Open and close reader settings', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.zoomInButton).toBeVisible();
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.zoomInButton).not.toBeVisible();
  });

  test('Display default settings', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.settingsButton.click();
    await expect(pdfReaderPage.paginatedMode).toBeChecked();
  });

  test('Change pagination style', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.settingsButton.click();
    await pdfReaderPage.scrollingMode.click();
    await expect(pdfReaderPage.scrollingMode).toBeChecked();
    await pdfReaderPage.settingsButton.click();
    await pdfReaderPage.scrollDown();
    await pdfReaderPage.scrollUp();
    await pdfReaderPage.settingsButton.click();
    await pdfReaderPage.paginatedMode.click();
    await expect(pdfReaderPage.paginatedMode).toBeChecked();
  });

  test('Zoom in', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(await pdfReaderPage.zoomIn()).toBeTruthy;
  });

  test('Zoom out', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(await pdfReaderPage.zoomOut()).toBeTruthy;
  });

  test('Open and exit full screen', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
    await pdfReaderPage.fullScreenButton.click();
    await pdfReaderPage.exitFullScreenButton.click();
    await expect(pdfReaderPage.fullScreenButton).toBeVisible();
  });

  test('Change settings in full screen', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await pdfReaderPage.loadPub('/pdf/collection');
    await pdfReaderPage.fullScreenButton.click();
    await pdfReaderPage.changeSettings();
    await expect(pdfReaderPage.scrollingMode).toBeChecked();
  });
});
