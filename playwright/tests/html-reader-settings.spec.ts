import { test, expect } from '@playwright/test';
import { HtmlReaderPage } from '../pageobjects/web-reader.page.ts';

test.describe('Test HTML pub', () => {
  test('Confirm reader settings are visible', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
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
    await expect(htmlReaderPage.paginatedStyle).toBeVisible();
    await expect(htmlReaderPage.scrollingStyle).toBeVisible();
  });

  test('Open and close reader settings', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).not.toBeVisible();
  });

  test('Display default settings', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.defaultFont).toBeChecked();
    await expect(htmlReaderPage.whiteBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('100%');
    await expect(htmlReaderPage.paginatedStyle).toBeChecked();
  });

  test('Change font', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.serifFont.click();
    await expect(htmlReaderPage.serifFont).toBeChecked();
    await htmlReaderPage.sansSerifFont.click();
    await expect(htmlReaderPage.sansSerifFont).toBeChecked();
    await htmlReaderPage.dyslexiaFont.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await htmlReaderPage.defaultFont.click();
    await expect(htmlReaderPage.defaultFont).toBeChecked();
  });

  test('Change background color', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.sepiaBackground.click();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await htmlReaderPage.blackBackground.click();
    await expect(htmlReaderPage.blackBackground).toBeChecked();
    await htmlReaderPage.whiteBackground.click();
    await expect(htmlReaderPage.whiteBackground).toBeChecked();
  });

  test('Change text size', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.decreaseTextSize.click();
    await expect(await htmlReaderPage.getTextSize()).toBe('96%');
    await htmlReaderPage.resetTextSize.click();
    await htmlReaderPage.increaseTextSize.click();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
  });

  test('Change pagination style', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.scrollingStyle.click();
    await expect(htmlReaderPage.scrollingStyle).toBeChecked();
    await htmlReaderPage.scrollDown();
    await htmlReaderPage.scrollUp();
    await expect(htmlReaderPage.settingsButton).toBeVisible();
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.paginatedStyle.click();
    await expect(htmlReaderPage.paginatedStyle).toBeChecked();
  });

  test('Stay on same page or chapter when change pagination style', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.tocButton.click();
    await htmlReaderPage.chapterName.click();
    await htmlReaderPage.settingsButton.click();
    await htmlReaderPage.scrollingStyle.click();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
    await htmlReaderPage.paginatedStyle.click();
    await expect(htmlReaderPage.chapterHeading).toBeVisible();
  });

  test('Maintain changed settings when exit and reenter reader', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.changeSettings();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
    await expect(htmlReaderPage.scrollingStyle).toBeChecked();
  });

  test('Maintain changed settings in other pubs', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.changeSettings();
    await htmlReaderPage.loadPage('/html/moby-epub2');
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.dyslexiaFont).toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('104%');
    await expect(htmlReaderPage.scrollingStyle).toBeChecked();
  });

  test('Reset all reader settings', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.changeSettings();
    await htmlReaderPage.resetTextSize.click();
    await expect(htmlReaderPage.defaultFont).toBeChecked();
    await expect(htmlReaderPage.whiteBackground).toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).toBe('100%');
    await expect(htmlReaderPage.paginatedStyle).toBeChecked();
  });

  test('Does not maintain changed settings for specific pub when exit and reenter reader', async ({
    page,
  }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3-no-local-storage');
    await htmlReaderPage.changeSettings();
    await htmlReaderPage.backButton.click();
    await expect(htmlReaderPage.webReaderHomepage).toBeVisible();
    await htmlReaderPage.loadPage('/html/moby-epub3-no-local-storage');
    await htmlReaderPage.settingsButton.click();
    await expect(htmlReaderPage.dyslexiaFont).not.toBeChecked();
    await expect(htmlReaderPage.sepiaBackground).not.toBeChecked();
    await expect(await htmlReaderPage.getTextSize()).not.toBe('104%');
    await expect(htmlReaderPage.scrollingStyle).not.toBeChecked();
  });

  test('Open and exit full screen', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.fullScreenButton.click();
    await htmlReaderPage.exitFullScreenButton.click();
    await expect(htmlReaderPage.fullScreenButton).toBeVisible();
  });

  test('Change settings in full screen', async ({ page }) => {
    const htmlReaderPage = new HtmlReaderPage(page);
    await htmlReaderPage.loadPage('/html/moby-epub3');
    await htmlReaderPage.fullScreenButton.click();
    await htmlReaderPage.changeSettings();
  });
});
