import { test, expect } from '@playwright/test';
import { HtmlReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test settings in HTML pub', () => {
  test('Confirm reader settings are visible', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).toBeVisible();
    await expect(htmlReaderPage.serifFont).toBeVisible();
    await expect(htmlReaderPage.sansSerifFont).toBeVisible();
    await expect(htmlReaderPage.dyslexiaFont).toBeVisible();
    await expect(htmlReaderPage.whiteBackground).toBeVisible();
    await expect(htmlReaderPage.sepiaBackground).toBeVisible();
    await expect(htmlReaderPage.blackBackground).toBeVisible();
    await expect(htmlReaderPage.resetTextSize).toBeVisible();
    await expect(htmlReaderPage.decreaseTextSize).toBeVisible();
    await expect(htmlReaderPage.increaseTextSize).toBeVisible();
    await expect(htmlReaderPage.paginatedMode).toBeVisible();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
  });

  test('Open and close reader settings', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).toBeVisible();
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).not.toBeVisible();
  });

  test('Display default settings', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).toBeVisible();
    await expect(htmlReaderPage.defaultFont).toBeChecked();
    await expect(htmlReaderPage.whiteBackground).toBeVisible();
    await expect(htmlReaderPage.whiteBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('100%');
    await expect(htmlReaderPage.paginatedMode).toBeVisible();
    await expect(htmlReaderPage.paginatedMode).toBeChecked();
  });

  test('Change font', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.serifFont).toBeVisible();
    await htmlReaderPage.serifFont.click();
    await expect(htmlReaderPage.serifFont).toBeChecked();
    await expect(htmlReaderPage.sansSerifFont).toBeVisible();
    await htmlReaderPage.sansSerifFont.click();
    await expect(htmlReaderPage.sansSerifFont).toBeChecked();
    await expect(htmlReaderPage.dyslexiaFont).toBeVisible();
    await htmlReaderPage.dyslexiaFont.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await expect(htmlReaderPage.defaultFont).toBeVisible();
    await htmlReaderPage.defaultFont.click();
    await expect(htmlReaderPage.defaultFont).toBeChecked();
  });

  test('Change background color', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.sepiaBackground).toBeVisible();
    await htmlReaderPage.sepiaBackground.click();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await expect(htmlReaderPage.blackBackground).toBeVisible();
    await htmlReaderPage.blackBackground.click();
    await expect(htmlReaderPage.blackBackground).toBeChecked();
    await expect(htmlReaderPage.whiteBackground).toBeVisible();
    await htmlReaderPage.whiteBackground.click();
    await expect(htmlReaderPage.whiteBackground).toBeChecked();
  });

  test('Change text size', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.decreaseTextSize).toBeVisible();
    await htmlReaderPage.decreaseTextSize.click();
    await expect(await htmlReaderPage.getTextSize()).toBe('96%');
    await expect(htmlReaderPage.resetTextSize).toBeVisible();
    await htmlReaderPage.resetTextSize.click();
    await expect(htmlReaderPage.increaseTextSize).toBeVisible();
    await htmlReaderPage.increaseTextSize.click();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
  });

  test('Change pagination mode', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.scrollingMode).toBeChecked();
    await expect(htmlReaderPage.paginatedMode).toBeVisible();
    await htmlReaderPage.paginatedMode.click();
    await expect(htmlReaderPage.paginatedMode).toBeChecked();
  });

  test('Stay on same page or chapter when change pagination mode', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.tocButton).toBeVisible();
    await htmlReaderPage.tocButton.click();
    await expect(htmlReaderPage.chapterName).toBeVisible();
    await htmlReaderPage.chapterName.click();
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await htmlReaderPage.scrollingMode.click();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
    await expect(htmlReaderPage.paginatedMode).toBeVisible();
    await htmlReaderPage.paginatedMode.click();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
  });

  test('Maintain changed settings when exit and reenter reader', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await htmlReaderPage.changeSettings();
    await expect(htmlReaderPage.backButton).toBeVisible();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeVisible();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).toBeVisible();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await expect(htmlReaderPage.scrollingMode).toBeChecked();
  });

  test('Maintain changed settings in other pubs', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await htmlReaderPage.changeSettings();
    await htmlReaderPage.loadPub('/html/moby-epub2');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeVisible();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).toBeVisible();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await expect(htmlReaderPage.scrollingMode).toBeChecked();
  });

  test('Reset all reader settings', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await htmlReaderPage.changeSettings();
    await expect(htmlReaderPage.resetTextSize).toBeVisible();
    await htmlReaderPage.resetTextSize.click();
    await expect(htmlReaderPage.defaultFont).toBeVisible();
    await expect(htmlReaderPage.defaultFont).toBeChecked();
    await expect(htmlReaderPage.whiteBackground).toBeVisible();
    await expect(htmlReaderPage.whiteBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('100%');
    await expect(htmlReaderPage.paginatedMode).toBeVisible();
    await expect(htmlReaderPage.paginatedMode).toBeChecked();
  });

  test('Does not maintain changed settings for specific pub when exit and reenter reader', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3-no-local-storage');
    await htmlReaderPage.changeSettings();
    await expect(htmlReaderPage.backButton).toBeVisible();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPub('/html/moby-epub3-no-local-storage');
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeVisible();
    await expect(htmlReaderPage.dyslexiaFont).not.toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).toBeVisible();
    await expect(htmlReaderPage.sepiaBackground).not.toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).not.toBe('104%');
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await expect(htmlReaderPage.scrollingMode).not.toBeChecked();
  });

  test('Open and exit full screen', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
    await htmlReaderPage.fullScreenButton.click();
    await expect(htmlReaderPage.exitFullScreenButton).toBeVisible();
    await htmlReaderPage.exitFullScreenButton.click();
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
  });

  test('Change settings in full screen', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPub('/html/moby-epub3');
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
    await htmlReaderPage.fullScreenButton.click();
    await htmlReaderPage.changeSettings();
    await expect(htmlReaderPage.dyslexiaFont).toBeVisible();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).toBeVisible();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
    await expect(htmlReaderPage.scrollingMode).toBeVisible();
    await expect(htmlReaderPage.scrollingMode).toBeChecked();
  });
});
