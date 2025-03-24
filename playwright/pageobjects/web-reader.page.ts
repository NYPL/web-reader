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

    // footer
    this.previousPageButton = page.getByLabel('Previous Page');
    this.nextPageButton = page.getByLabel('Next Page');
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
    await expect(this.dyslexiaFont).toBeChecked();
    await this.sepiaBackground.click();
    await expect(this.sepiaBackground).toBeChecked();
    await this.increaseTextSize.click();
    await expect(await this.getTextSize()).toBe('104%');
    await this.scrollingStyle.click();
    await expect(this.scrollingStyle).toBeChecked();
  }

  async scrollDown(): Promise<void> {
    await this.tocButton.click();
    await this.page
      .getByText('EXTRACTS (Supplied by a Sub-Sub-Librarian).')
      .click();
    await this.page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByText('—WHALE SONG.')
      .scrollIntoViewIfNeeded();
  }

  async scrollUp(): Promise<void> {
    await this.page
      .locator('iframe[title="Moby-Dick"]')
      .contentFrame()
      .getByText('—WHALE SONG.')
      .scrollIntoViewIfNeeded();
    await this.page
      .getByText('EXTRACTS (Supplied by a Sub-Sub-Librarian).')
      .scrollIntoViewIfNeeded();
  }
}

class PdfReaderPage extends WebReaderPage {
  async changeSettings(): Promise<void> {
    await this.settingsButton.click();
    await this.zoomInButton.click();
    await this.scrollingStyle.click();
    await expect(this.scrollingStyle).toBeChecked();
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
    await this.page
      .locator('#mainContent')
      .locator('[data-page-number="2"]')
      .scrollIntoViewIfNeeded();
  }

  async scrollUp(): Promise<void> {
    await this.scrollDown();
    await this.page
      .locator('#mainContent')
      .locator('[data-page-number="1"]')
      .scrollIntoViewIfNeeded();
  }
}

export { WebReaderPage, HtmlReaderPage, PdfReaderPage };
