import { Locator, Page, expect } from '@playwright/test';

class WebReaderPage {
  readonly page: Page;
  readonly webReaderHomepage: Locator;
  readonly backButton: Locator;
  readonly tocButton: Locator;
  readonly settingsButton: Locator;
  readonly paginatedMode: Locator;
  readonly scrollingMode: Locator;
  readonly fullScreenButton: Locator;
  readonly exitFullScreenButton: Locator;
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
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

    // settings
    this.paginatedMode = page.getByText('Paginated', { exact: true });
    this.scrollingMode = page.getByText('Scrolling', { exact: true });

    // footer
    this.nextPageButton = this.page
      .getByRole('contentinfo')
      .getByRole('button', {
        name: 'Next Page',
      });
    this.previousPageButton = page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Previous Page' });
  }

  async changeScreenSize(): Promise<void> {
    await this.page.setViewportSize({ width: 412, height: 915 }); // Samsung Galaxy S20 Ultra
  }
}

class HtmlReaderPage extends WebReaderPage {
  // settings
  readonly defaultFont = this.page.getByText('Default', { exact: true });
  readonly serifFont = this.page.getByText('Serif', { exact: true });
  readonly sansSerifFont = this.page.getByText('Sans-Serif', { exact: true });
  readonly dyslexiaFont = this.page.getByText('Dyslexia', { exact: true });

  readonly whiteBackground = this.page.getByText('Day', { exact: true });
  readonly sepiaBackground = this.page.getByText('Sepia', { exact: true });
  readonly blackBackground = this.page.getByText('Night', { exact: true });

  readonly resetTextSize = this.page.getByLabel('Reset settings');
  readonly decreaseTextSize = this.page.getByLabel('Decrease font size');
  readonly increaseTextSize = this.page.getByLabel('Increase font size');

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
    const htmlElement = this.page.frameLocator('#mainContent').locator('html');
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
    await expect(this.scrollingMode).toBeVisible();
    await this.scrollingMode.click();
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
}

class PdfReaderPage extends WebReaderPage {
  // settings
  readonly zoomInButton = this.page.getByRole('button', { name: 'Zoom In' });
  readonly zoomOutButton = this.page.getByRole('button', { name: 'Zoom Out' });

  // content
  readonly pageOne = this.page
    .locator('#mainContent')
    .locator('[data-page-number="1"]');
  readonly pageTwo = this.page
    .locator('#mainContent')
    .locator('[data-page-number="2"]');
  readonly firstIndexPage = this.page.getByText('367', { exact: true });
  readonly lastIndexPage = this.page.getByText('376', { exact: true });
  readonly permissionsPage = this.page
    .locator('[data-page-number="2"]')
    .getByText('Permissions', { exact: true });

  async loadPub(gotoPage: string): Promise<WebReaderPage> {
    await this.page.goto(gotoPage, { waitUntil: 'domcontentloaded' });
    await this.loadPage();
    await expect(this.pageOne).toBeVisible();
    return new WebReaderPage(this.page);
  }

  async loadPage(): Promise<void> {
    const loadingBook = this.page.getByLabel('Loading book...');
    await expect(loadingBook).not.toBeVisible();
    const loadingPDF = this.page.getByText('Loading PDF…');
    await expect(loadingPDF).not.toBeVisible();
  }

  async changeSettings(): Promise<void> {
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    await expect(this.zoomInButton).toBeVisible();
    await this.zoomInButton.click();
    await expect(this.scrollingMode).toBeVisible();
    await this.scrollingMode.click();
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
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    await expect(this.zoomInButton).toBeVisible();
    await this.zoomInButton.click();
    const afterScaleFactor = await this.getZoomValue();
    expect(afterScaleFactor).toBeGreaterThan(beforeScaleFactor);
  }

  async zoomOut(): Promise<void> {
    const beforeScaleFactor = await this.getZoomValue();
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    await expect(this.zoomOutButton).toBeVisible();
    await this.zoomOutButton.click();
    const afterScaleFactor = await this.getZoomValue();
    expect(afterScaleFactor).toBeLessThan(beforeScaleFactor);
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
    await expect(this.settingsButton).toBeVisible();
    await this.settingsButton.click();
    await expect(this.scrollingMode).toBeVisible();
    await this.scrollingMode.click();
    await expect(this.tocButton).toBeVisible();
    await this.tocButton.click();
    await expect(this.lastChapter).toBeVisible();
    await this.lastChapter.click();
    await this.loadPage();
    await this.scrollUp();
  }
}

export { WebReaderPage, HtmlReaderPage, PdfReaderPage };
