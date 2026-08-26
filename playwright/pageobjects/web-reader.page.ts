import { Locator, Page, expect } from '@playwright/test';

class WebReaderPage {
  readonly page: Page;
  readonly webReaderHomepage: Locator;
  readonly tocButton: Locator;
  readonly settingsButton: Locator;
  readonly fullScreenButton: Locator;
  readonly exitFullScreenButton: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly pageInput: Locator;
  readonly firstChapter: Locator;
  readonly lastChapter: Locator;

  constructor(page: Page) {
    this.page = page;

    // web reader examples homepage
    this.webReaderHomepage = page.getByRole('heading', {
      name: 'NYPL Web Reader',
    });

    // header
    this.tocButton = page.getByLabel('Table of Contents');
    this.firstChapter = page.getByRole('menuitem').first();
    this.lastChapter = page.getByRole('menuitem').last();
    this.settingsButton = page.getByRole('button', {
      name: 'Settings',
      exact: true,
    });
    this.fullScreenButton = page.getByRole('button', {
      name: 'Enter full screen mode',
    });
    this.exitFullScreenButton = page.getByRole('button', {
      name: 'Exit full screen mode',
    });
    this.nextPageButton = this.page.getByRole('button', {
      name: 'Next page',
    });
    this.previousPageButton = page.getByRole('button', {
      name: 'Previous page',
    });
    this.pageInput = page.getByRole('spinbutton', {
      name: 'Current page number',
    });
  }

  async changeScreenSize(): Promise<void> {
    await this.page.setViewportSize({ width: 412, height: 915 }); // Samsung Galaxy S20 Ultra
  }
}

class HtmlReaderPage extends WebReaderPage {
  // settings
  readonly defaultFont = this.page.getByText('Default', { exact: true });
  readonly serifFont = this.page.getByText('Serif', { exact: true });
  readonly sansSerifFont = this.page.getByText('Sans-serif', { exact: true });
  readonly dyslexiaFont = this.page.getByText('Dyslexia', { exact: true });

  readonly whiteBackground = this.page.getByText('Day', { exact: true });
  readonly sepiaBackground = this.page.getByText('Sepia', { exact: true });
  readonly blackBackground = this.page.getByText('Night', { exact: true });

  readonly resetTextSize = this.page.getByLabel('Reset all');
  readonly decreaseTextSize = this.page.getByLabel('Decrease text');
  readonly increaseTextSize = this.page.getByLabel('Increase text');

  // content
  readonly chapterName = this.page.getByText(
    'EXTRACTS (Supplied by a Sub-Sub-Librarian).'
  );
  readonly chapterHeading = this.page
    .locator('iframe[title="Moby-Dick"]')
    .contentFrame()
    .getByRole('heading', {
      name: 'EXTRACTS (Supplied by a Sub-Sub-Librarian).',
      level: 1,
    });
  readonly specificText = this.page
    .locator('iframe[title="Moby-Dick"]')
    .contentFrame()
    .getByText('—WHALE SONG.');
  readonly internalLink = this.page
    .locator('iframe[title="Moby-Dick"]')
    .contentFrame()
    .getByRole('link', { name: 'Title Page' });
  readonly titlePage = this.page
    .locator('iframe[title="Moby-Dick"]')
    .contentFrame()
    .getByRole('img', { name: 'title page' });
  readonly externalLink = this.page
    .locator('iframe[title="Moby-Dick"]')
    .contentFrame()
    .getByRole('link', { name: 'www.gutenberg.org' });
  readonly epubCover = this.page
    .locator('iframe[title="Moby Dick\\; Or\\, The Whale"]')
    .contentFrame()
    .getByRole('img', { name: 'Cover' });

  async loadPub(gotoPage: string): Promise<WebReaderPage> {
    await this.page.goto(gotoPage, { waitUntil: 'domcontentloaded' });
    const loadingBook = this.page.getByLabel('Loading book...');
    await expect(loadingBook).not.toBeVisible();
    return new WebReaderPage(this.page);
  }

  async loadPage(): Promise<void> {
    const loadingBook = this.page.getByLabel('Loading book...');
    await expect(loadingBook).not.toBeVisible();
  }

  async getIframe(): Promise<Locator> {
    const htmlElement = this.page
      .frameLocator('#reader-content')
      .locator('html');
    return htmlElement;
  }

  async getTextSize(): Promise<undefined | string> {
    return (await this.getIframe()).evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('--USER__fontSize');
    });
  }

  async changeSettings(): Promise<void> {
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    await expect(this.dyslexiaFont).toBeVisible();
    await this.dyslexiaFont.click();
    await expect(this.sepiaBackground).toBeVisible();
    await this.sepiaBackground.click();
    await expect(this.increaseTextSize).toBeVisible();
    await this.increaseTextSize.click();
  }

  async scrollDown(): Promise<void> {
    await this.specificText.scrollIntoViewIfNeeded();
    await expect(this.specificText).toBeVisible();
  }

  async scrollUp(): Promise<void> {
    await this.scrollDown();
    await this.chapterHeading.scrollIntoViewIfNeeded();
    await expect(this.chapterHeading).toBeVisible();
  }

  async navigateReader(): Promise<void> {
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeDisabled();
    await this.nextPageButton.click();
    await this.loadPage();
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeEnabled();
    await this.previousPageButton.click();
    await this.loadPage();
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeDisabled();
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    await expect(this.tocButton).toBeVisible();
    await this.tocButton.click();
    await expect(this.chapterName).toBeVisible();
    await this.chapterName.click();
    await this.loadPage();
    await expect(this.chapterHeading).toBeVisible();
    await this.scrollUp();
  }
}

class PdfReaderPage extends WebReaderPage {
  // settings
  readonly zoomInButton = this.page.getByRole('button', { name: 'Zoom In' });
  readonly zoomOutButton = this.page.getByRole('button', { name: 'Zoom Out' });

  // content
  readonly pageOne = this.page
    .locator('#reader-content')
    .locator('[data-page-number="1"]');
  readonly pageTwo = this.page
    .locator('#reader-content')
    .locator('[data-page-number="2"]');
  readonly firstIndexPage = this.page.getByText('3', { exact: true });
  readonly lastIndexPage = this.page.getByText('7', { exact: true });

  async loadPub(gotoPage: string): Promise<WebReaderPage> {
    await this.page.goto(gotoPage, { waitUntil: 'domcontentloaded' });
    await this.loadPage();
    await expect(this.pageOne).toBeVisible();
    return new WebReaderPage(this.page);
  }

  async loadPage(): Promise<void> {
    const loadingPDF = this.page.getByText('Loading...');
    await expect(loadingPDF).not.toBeVisible();
    const loadingBook = this.page.getByLabel('Loading book...');
    await expect(loadingBook).not.toBeVisible();
  }

  async getZoomValue(): Promise<number> {
    const textLayer = this.pageOne.locator('.textLayer');
    let value = 0;
    await expect
      .poll(async () => {
        value = await textLayer.evaluate((el) =>
          Number(window.getComputedStyle(el).getPropertyValue('--scale-factor'))
        );
        return value;
      })
      .toBeGreaterThan(0);
    return value;
  }

  async zoomIn(): Promise<void> {
    const beforeScaleFactor = await this.getZoomValue();
    await expect(this.zoomInButton).toBeVisible();
    await this.zoomInButton.click();
    await expect
      .poll(() => this.getZoomValue())
      .toBeGreaterThan(beforeScaleFactor);
  }

  async zoomOut(): Promise<void> {
    const beforeScaleFactor = await this.getZoomValue();
    await expect(this.zoomOutButton).toBeVisible();
    await this.zoomOutButton.click();
    await expect
      .poll(() => this.getZoomValue())
      .toBeLessThan(beforeScaleFactor);
  }

  async scrollDown(): Promise<void> {
    await this.pageTwo.scrollIntoViewIfNeeded();
    await expect(this.pageTwo).toBeVisible();
  }

  async scrollUp(): Promise<void> {
    await this.scrollDown();
    await this.pageOne.scrollIntoViewIfNeeded();
    await expect(this.pageOne).toBeVisible();
  }

  async navigateReader(): Promise<void> {
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeDisabled();
    await this.nextPageButton.click();
    await this.loadPage();
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeEnabled();
    await this.previousPageButton.click();
    await this.loadPage();
    await expect(this.nextPageButton).toBeVisible();
    await expect(this.nextPageButton).toBeEnabled();
    await expect(this.previousPageButton).toBeVisible();
    await expect(this.previousPageButton).toBeDisabled();
    await expect(this.tocButton).toBeVisible();
    await this.tocButton.click();
    await expect(this.lastChapter).toBeVisible();
    await this.lastChapter.click();
    await this.loadPage();
    await this.scrollUp();
  }
}

export { HtmlReaderPage, PdfReaderPage, WebReaderPage };
