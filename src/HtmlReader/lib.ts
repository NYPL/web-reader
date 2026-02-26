import { Injectable } from '../Readium/Injectable';
import { Locator } from '../Readium/Locator';
import { WebpubManifest, ColorMode, FontFamily } from '../types';
import { ReadiumLink } from '../WebpubManifestTypes/ReadiumLink';
import { ActiveState } from './types';

/**
 * Constants
 */
export const FONT_SIZE_STEP = 4;

export const defaultInjectables: Injectable[] = [];
export const defaultInjectablesFixed: Injectable[] = [];

/**
 * Creates an element for an injectable so it can be injected into the iframe.
 */
export function makeInjectableElement(
  document: Document,
  injectable: Injectable
): HTMLElement | undefined {
  switch (injectable.type) {
    case 'style': {
      const el = document.createElement('link');
      el.setAttribute('rel', 'stylesheet');
      if (injectable.url) {
        el.setAttribute('href', injectable.url);
      } else {
        console.warn('Injectable missing url', injectable);
      }
      return el;
    }

    case 'script': {
      const el = document.createElement('script');
      el.setAttribute('type', 'text/javascript');
      if (injectable.url) {
        el.setAttribute('src', injectable.url);
      } else {
        console.warn('Injectable missing url', injectable);
      }
      return el;
    }

    default:
      return undefined;
  }
}

/**
 * gets the index of the current location href
 */
export function getCurrentIndex(
  manifest: WebpubManifest,
  state: ActiveState,
  baseUrl: string
): number {
  const i = manifest.readingOrder.findIndex((link) =>
    isSameResource(link.href, state.location?.href, baseUrl)
  );
  if (i === -1) {
    console.warn("Couldn't find current location in manifest. Returning 0.");
  }
  return i === -1 ? 0 : i;
}

/**
 * Find a link in the reading order from a passed in href.
 */
export function getFromReadingOrder(
  href: string,
  manifest: WebpubManifest,
  baseUrl: string
): { link: ReadiumLink; index: number } | undefined {
  const i = manifest.readingOrder.findIndex((link) => {
    return isSameResource(link.href, href, baseUrl);
  });

  return i !== -1
    ? {
        link: manifest.readingOrder[i],
        index: i,
      }
    : undefined;
}

/**
 * Check if two hrefs share the same pathname. They can be absolute
 * or relative. This will ignore hash and query params.
 */
export function isSameResource(
  href1: string,
  href2: string,
  baseUrl: string
): boolean {
  try {
    const url1 = new URL(href1, baseUrl);
    const url2 = new URL(href2, baseUrl);
    const doMatch =
      url1.origin === url2.origin && url1.pathname === url2.pathname;
    return doMatch;
  } catch (e) {
    console.error(e);
  }

  return false;
}

/**
 * Converts a ReadiumLink to a Locator
 */
export function linkToLocator(
  link: ReadiumLink,
  baseUrl: string,
  locations: Locator['locations'] = {}
): Locator {
  const url = new URL(link.href, baseUrl);
  const hash = url.hash;
  const hrefWithoutHash = url.origin + url.pathname;
  // add the hash if we don't already have a fragment
  if (hash && !locations?.fragment) locations.fragment = hash;
  return {
    href: hrefWithoutHash,
    title: link.title,
    type: link.type ?? 'text/html',
    locations,
  };
}

type CalculatedPosition = {
  isHorizontalPaginated: boolean;
  containerSize: number;
  containerWidth: number;
  containerHeight: number;
  pageSize: number;
  resourceSize: number;
  scrollPosition: number;
  totalPages: number;
  progression: number;
  currentPage: number;
  currentPageFloor: number;
  isAtEnd: boolean;
  isAtStart: boolean;
};

/**
 * Calculate current position information
 */
export function calcPosition(
  iframe: HTMLIFrameElement,
  isScrolling: boolean
): CalculatedPosition {
  /**
   * Calculate the current scroll position and number of pages,
   * and thus the page index, total pages and progression
   */
  const containerHeight = iframe.offsetHeight;
  const containerWidth = iframe.offsetWidth;
  const isHorizontalPaginated = !isScrolling;
  const containerSize = isHorizontalPaginated
    ? containerWidth
    : containerHeight;
  const pageSize = containerSize;
  const html = getIframeHTML(iframe);
  const resourceHeight = html.scrollHeight;
  const resourceWidth = html.scrollWidth;
  const resourceSize = isHorizontalPaginated ? resourceWidth : resourceHeight;
  const { x: scrollXPosition, y: scrollYPosition } = getScrollPosition(html);
  const scrollPosition = isHorizontalPaginated
    ? scrollXPosition
    : scrollYPosition;
  const totalPages =
    Math.ceil((resourceSize - containerSize) / containerSize) + 1;
  const progression = scrollPosition / resourceSize;

  const isAtBottom = scrollPosition + containerSize === resourceSize;

  // we use round to get the closest page to the scrollTop, unless
  // you are at the complete bottom.
  const currentPage = isAtBottom
    ? totalPages
    : Math.round(progression * totalPages) + 1;
  // we use floor to get the nearest fully read page.
  const currentPageFloor = Math.floor(progression * totalPages) + 1;

  // you're at the end if the scroll position + containerSize === resourceSize
  const isAtEnd = currentPage === totalPages;
  const isAtStart = currentPage === 1;

  return {
    isHorizontalPaginated,
    containerSize,
    containerWidth,
    containerHeight,
    pageSize,
    resourceSize,
    scrollPosition,
    totalPages,
    progression,
    currentPage,
    currentPageFloor,
    isAtEnd,
    isAtStart,
  };
}

/**
 * Gets scroll position of an element
 */
export function getScrollPosition(element: HTMLElement | undefined | null): {
  x: number;
  y: number;
} {
  if (!element) return { x: 0, y: 0 };
  const { scrollTop, scrollLeft } = element;
  return {
    x: scrollLeft,
    y: scrollTop,
  };
}

/**
 * Fetches a resource as text
 */
export async function fetchAsTxt(url: string): Promise<string> {
  const res = await fetch(url);
  const txt = await res.text();
  return txt;
}

/**
 * Inject some raw JS into the iframe document
 */
export function injectJS(document: Document): void {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.textContent = `
    window.onload = () => {
      window.top.postMessage({source: 'reader-iframe', type: 'IFRAME_LOADED'})
    }
  `;
  document.head.appendChild(script);
}

export function getMaybeIframeHtml(
  iframe: HTMLIFrameElement
): HTMLElement | undefined {
  try {
    return getIframeHTML(iframe);
  } catch (e) {
    return undefined;
  }
}

/**
 * Get the HTML element of the iframe
 */
export function getIframeHTML(iframe: HTMLIFrameElement): HTMLElement {
  const html = iframe?.contentDocument?.documentElement;
  if (!html) {
    throw new Error('Attempting to access iframe HTML before it exists');
  }
  return html;
}

/**
 * Sets a CSS var on the html element in the iframe. Used to set
 * ReadiumCSS settings like scrolling and color mode and font
 * size.
 */
export function setCSSProperty(
  html: HTMLElement,
  name: string,
  val: string
): void {
  html.style.setProperty(name, val);
}

/**
 * Translates the readium scroll css var into a boolean
 */
export function getPagination(
  isPaginated: boolean
): 'readium-scroll-on' | 'readium-scroll-off' {
  switch (isPaginated) {
    case true:
      return 'readium-scroll-on';
    case false:
      return 'readium-scroll-off';
  }
}

/**
 * Translates the internal color mode value into a Readium
 * color mode value.
 */
export function getColorModeValue(
  mode: ColorMode
): 'readium-default-on' | 'readium-night-on' | 'readium-sepia-on' {
  switch (mode) {
    case 'day':
      return 'readium-default-on';
    case 'night':
      return 'readium-night-on';
    case 'sepia':
      return 'readium-sepia-on';
  }
}

/**
 * Translates the readium color mode value into an internal
 * color mode value
 */
export function getColorMode(d2Mode: string): ColorMode {
  switch (d2Mode) {
    case 'readium-default-on':
      return 'day';
    case 'readium-night-on':
      return 'night';
    case 'readium-sepia-on':
      return 'sepia';
    default:
      console.error('COLOR MODE SLIPPED THROUG', d2Mode);
      return 'day';
  }
}

/**
 * Gets the Readium font-override setting based on the given font family.
 */
export function getFontOverride(
  fontFamily: FontFamily
): 'readium-font-off' | 'readium-font-on' {
  switch (fontFamily) {
    case 'publisher':
      return 'readium-font-off';
    default:
      return 'readium-font-on';
  }
}

/**
 * Translates the internal font family to a readium css font family value.
 */
export const familyToReadiumFamily: Record<FontFamily, string> = {
  publisher: 'Original',
  serif: 'serif',
  'sans-serif': 'sans-serif',
  'open-dyslexic': 'opendyslexic',
};
/**
 * Translates a readium css font family to an internal font family.
 */
export const r2FamilyToFamily: Record<string, FontFamily | undefined> = {
  Original: 'publisher',
  serif: 'serif',
  'sans-serif': 'sans-serif',
  opendyslexic: 'open-dyslexic',
};
