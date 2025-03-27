import { test, expect } from '@playwright/test';
import { PdfReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test navigation in PDF pub', () => {
  test('Displays reader navigation in PDF pub', async ({ page }) => {
    const pdfReaderPage = new PdfReaderPage(page);
    await page.goto('/pdf/collection');
    await expect(pdfReaderPage.backButton).toBeVisible();
    await expect(pdfReaderPage.nextPageButton).toBeVisible();
    await expect(pdfReaderPage.previousPageButton).toBeVisible();
    await expect(pdfReaderPage.tocButton).toBeVisible();
    await pdfReaderPage.tocButton.click();
    await expect(pdfReaderPage.firstChapter).toBeVisible();
    await expect(pdfReaderPage.lastChapter).toBeVisible();
  });
});
