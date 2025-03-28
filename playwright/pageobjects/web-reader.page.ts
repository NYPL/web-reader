import { Locator, Page, expect } from '@playwright/test';

class WebReaderPage {
  readonly page: Page;
  readonly webReaderHomepage: Locator;
  readonly backButton: Locator;
  readonly tocButton: Locator;
  readonly settingsButton: Locator;
  readonly defaultFont: Locator;
  readonly serifFont: Locator;
  readonly sansSerifFont: Locator;
  readonly dyslexiaFont: Locator;
  readonly whiteBackground: Locator;
  readonly sepiaBackground: Locator;
  readonly blackBackground: Locator;
  readonly resetTextSize: Locator;
  readonly decreaseTextSize: Locator;
  readonly increaseTextSize: Locator;
  readonly zoomInButton: Locator;
  readonly zoomOutButton: Locator;
  readonly paginatedStyle: Locator;
  readonly scrollingStyle: Locator;
  readonly fullScreenButton: Locator;
  readonly exitFullScreenButton: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly firstChapter: Locator;
  readonly lastChapter: Locator;
  readonly chapterName: Locator;
  readonly chapterHeading: Locator;
  readonly specificText: Locator;
  readonly pageOne: Locator;
  readonly pageTwo: Locator;
  readonly internalLink: Locator;
  readonly titlePage: Locator;
  readonly externalLink: Locator;
  readonly epubCover: Locator;

  constructor(page: Page) {
    this.page = page;

    // web reader examples homepage
    this.webReaderHomepage = page.getByRole('heading', {
      name: 'NYPL Web Reader',
    });

    // header
    this.backButton = page.getByLabel('Return to Homepage');
    this.tocButton = page.getByLabel('Table of Contents');
    this.firstChapter = page.getByRole('menuitem').first();
    this.lastChapter = page.getByRole('menuitem').last();
    this.settingsButton = page.getByRole('button', {
      name: 'Settings',
      exact: true,
    });
    this.fullScreenButton = page.getByRole('button', {
      name: 'Toggle full screen',
    });
    this.exitFullScreenButton = page.getByText('Full screen exit', {
      exact: true,
    });

    // reader settings
    this.zoomInButton = page.getByRole('button', { name: 'Zoom In' });
    this.zoomOutButton = page.getByRole('button', { name: 'Zoom Out' });

    this.defaultFont = page.getByText('Default', { exact: true });
    this.serifFont = page.getByText('Serif', { exact: true });
    this.sansSerifFont = page.getByText('Sans-Serif', { exact: true });
    this.dyslexiaFont = page.getByText('Dyslexia', { exact: true });

    this.whiteBackground = page.getByText('Day', { exact: true });
    this.sepiaBackground = page.getByText('Sepia', { exact: true });
    this.blackBackground = page.getByText('Night', { exact: true });

    this.resetTextSize = page.getByLabel('Reset settings');
    this.decreaseTextSize = page.getByLabel('Decrease font size');
    this.increaseTextSize = page.getByLabel('Increase font size');

    this.paginatedStyle = page.getByText('Paginated', { exact: true });
    this.scrollingStyle = page.getByText('Scrolling', { exact: true });

    // content
    this.chapterName = page.getByText(
      'EXTRACTS (Supplied by a Sub-Sub-Librarian).'
    );
    this.chapterHeading = page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByRole('heading', {
        name: 'EXTRACTS (Supplied by a Sub-Sub-Librarian).',
        level: 1,
      });
    this.specificText = page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByText('—WHALE SONG.');
    this.pageOne = page
      .locator('#mainContent')
      .locator('[data-page-number="1"]');
    this.pageTwo = page
      .locator('#mainContent')
      .locator('[data-page-number="2"]');
    this.internalLink = page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByRole('link', { name: 'Title Page' });
    this.titlePage = page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByRole('img', { name: 'title page' });
    this.externalLink = page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByRole('link', { name: 'www.gutenberg.org' });
    this.epubCover = page
      .locator('iframe[title="Moby Dick\\; Or\\, The Whale"]')
      .contentFrame()
      .getByRole('img', { name: 'Cover' });

    // footer
    this.previousPageButton = page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Previous Page' });
    this.nextPageButton = page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Next Page' });
  }

  // hopefully better handles slow load time (use load or networkidle)
  async loadPage(gotoPage: string): Promise<WebReaderPage> {
    await this.page.goto(gotoPage, { waitUntil: 'load' });
    return new WebReaderPage(this.page);
  }
}

class HtmlReaderPage extends WebReaderPage {
  async getIframe(): Promise<Locator> {
    const htmlElement = this.page.frameLocator('#mainContent').locator('html');
    return htmlElement;
  }

  async getTextSize(): Promise<undefined | string> {
    return (await this.getIframe()).evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('--USER__fontSize');
    });
  }

  async changeSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.dyslexiaFont.click();
    await this.sepiaBackground.click();
    await this.increaseTextSize.click();
    await this.scrollingStyle.click();
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

  async changeScreenSize(): Promise<void> {
    await this.page.setViewportSize({ width: 412, height: 915 }); // Samsung Galaxy S20 Ultra
  }
}

class PdfReaderPage extends WebReaderPage {
  async changeSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.zoomInButton.click();
    await this.scrollingStyle.click();
  }

  async getZoomValue(): Promise<number> {
    return await this.page.locator('canvas').evaluate((el) => {
      return Number(
        window.getComputedStyle(el).getPropertyValue('--scale-factor')
      );
    });
  }

  async zoomIn(): Promise<void> {
    const beforeScaleFactor = await this.getZoomValue();
    await this.settingsButton.click();
    await this.zoomInButton.click();
    const afterScaleFactor = await this.getZoomValue();
    expect(afterScaleFactor).toBeGreaterThan(beforeScaleFactor);
  }

  async zoomOut(): Promise<void> {
    const beforeScaleFactor = await this.getZoomValue();
    await this.settingsButton.click();
    await this.zoomOutButton.click();
    const afterScaleFactor = await this.getZoomValue();
    expect(afterScaleFactor).toBeLessThan(beforeScaleFactor);
  }

  async scrollDown(): Promise<void> {
    await expect(this.pageTwo).toBeVisible();
    await this.pageTwo.scrollIntoViewIfNeeded();
  }

  async scrollUp(): Promise<void> {
    await this.scrollDown();
    await expect(this.pageOne).toBeVisible();
    await this.pageOne.scrollIntoViewIfNeeded();
  }
}

export { WebReaderPage, HtmlReaderPage, PdfReaderPage };
