import { ReaderSettings, WebpubManifest } from '../types';
import {
  calcPosition,
  familyToReadiumFamily,
  getColorModeValue,
  getFontOverride,
  getIframeHTML,
  getPagination,
  setCSSProperty,
} from './lib';

/**
 * These are effects that reach in to the iframe element and modify it.
 * They are not part of the reducer, and should only be called from within a
 * useEffect hook.
 */

/**
 * Scroll the HTML element to a given progression by
 * setting the scrollTop or the scrollLeft.
 */
export function navigateToProgression(
  iframe: HTMLIFrameElement,
  progression: number,
  isScrolling: boolean
): void {
  /**
   * Check for progression info. This is used
   *  - in paginated mode for changing pages
   *  - navigating backward
   *  - switching between scrolling and paginated mode (to keep location)
   */
  const { isHorizontalPaginated, resourceSize, totalPages } = calcPosition(
    iframe,
    isScrolling
  );
  const html = getIframeHTML(iframe);

  if (isHorizontalPaginated) {
    /**
     * snap that progression to the nearest page
     */
    const nearestPage = Math.round(progression * totalPages);
    const calculatedProgression = nearestPage / totalPages;
    const newScrollPosition = calculatedProgression * resourceSize;
    html.scrollLeft = newScrollPosition;
  } else {
    const newScrollPosition = progression * resourceSize;
    html.scrollTop = newScrollPosition;
  }
}

export function navigateToHash(
  fragment: string,
  iframe: HTMLIFrameElement,
  isScrolling: boolean
): void {
  const isHash = fragment.indexOf('#') === 0;
  if (isHash) {
    // we get the element by the hash, and scroll it into view
    const el = iframe.contentDocument?.querySelector(fragment);
    if (el) {
      el.scrollIntoView();
      // the element is now in view, but likely off center. We now
      // need to call navigateToProgression to re-align ourselves
      const { progression } = calcPosition(iframe, isScrolling);
      navigateToProgression(iframe, progression, isScrolling);
    } else {
      console.error('Could not find an element with id', fragment);
    }
  }
}

/**
 * Takes the HTML element and sets CSS variables on it based on the
 * reader's state
 */
export function setCss(
  iframeHtml: Document,
  settings: ReaderSettings,
  iframeContainer: HTMLElement | null,
  manifest: WebpubManifest | undefined
): void {
  const isFixedLayout = manifest?.metadata.presentation?.layout === 'fixed';
  if (isFixedLayout) {
    setFixedCss(iframeHtml, iframeContainer);
  } else {
    setReflowableCss(iframeHtml.documentElement, settings);
  }
}

export function setReflowableCss(
  iframeHtml: HTMLElement,
  settings: ReaderSettings
): void {
  setCSSProperty(
    iframeHtml,
    '--USER__scroll',
    getPagination(settings.isScrolling)
  );
  setCSSProperty(
    iframeHtml,
    '--USER__appearance',
    getColorModeValue(settings.colorMode)
  );
  setCSSProperty(iframeHtml, '--USER__advancedSettings', 'readium-advanced-on');
  setCSSProperty(
    iframeHtml,
    '--USER__fontOverride',
    getFontOverride(settings.fontFamily)
  );
  setCSSProperty(
    iframeHtml,
    '--USER__fontFamily',
    familyToReadiumFamily[settings.fontFamily]
  );
  setCSSProperty(iframeHtml, '--USER__fontSize', `${settings.fontSize}%`);
  // set the number of columns to only ever have 1.
  setCSSProperty(iframeHtml, '--USER__colCount', '1');

  setCSSProperty(
    iframeHtml,
    'overflow',
    settings.isScrolling ? 'scroll' : 'hidden'
  );
}

/**
 * Apply the transform property to the iframe document to fit the current screen viewport.
 */
export function setFixedCss(
  iframeDocument: Document,
  iframeContainer: HTMLElement | null
): void {
  if (!iframeContainer) return;

  let { contentWidth, contentHeight } =
    extractContentViewportSize(iframeDocument);

  const { containerWidth, containerHeight } =
    extractContentContainerSize(iframeContainer);

  // Make it default scale of 1 in case we don't have the content width/height
  contentWidth = contentWidth ?? containerWidth;
  contentHeight = contentHeight ?? containerHeight;

  // https://css-tricks.com/scaled-proportional-blocks-with-css-and-javascript/
  const scale = Math.min(
    containerWidth / contentWidth,
    containerHeight / contentHeight,
    1
  );

  setCSSProperty(
    iframeDocument.documentElement,
    'transform',
    `scale(${scale})`
  );

  // Transfrom from the center if the screen is large enough to render the book.
  const transformOrigin = contentWidth < containerWidth ? 'top center' : '0 0';
  setCSSProperty(
    iframeDocument.documentElement,
    'transform-origin',
    transformOrigin
  );

  setCSSProperty(iframeDocument.documentElement, 'overflow', 'hidden');
}

/**
 * Extract the publication's width and height from the iframe viewport meta tag.
 */
function extractContentViewportSize(iframeDocument: Document): {
  contentWidth: number | undefined;
  contentHeight: number | undefined;
} {
  const viewport = iframeDocument?.querySelector('meta[name="viewport"]');
  const content = viewport?.getAttribute('content');

  const width = content?.match(/width=(\d+)/);
  const height = content?.match(/height=(\d+)/);

  const contentWidth = width ? Number(width[1]) : undefined;
  const contentHeight = height ? Number(height[1]) : undefined;

  return { contentWidth, contentHeight };
}

/**
 * Extract the width and height of the main container where iframe resides.
 */
function extractContentContainerSize(container: HTMLElement): {
  containerWidth: number;
  containerHeight: number;
} {
  return {
    containerWidth: container.clientWidth,
    containerHeight: container.clientHeight,
  };
}
