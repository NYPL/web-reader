import { PdfFileType, WebpubManifest } from '../types';
import { ReadiumLink } from '../WebpubManifestTypes/ReadiumLink';

export const SCALE_STEP = 0.1;
export const START_QUERY = 'start';

export const getResourceUrl = (
  index: number,
  readingOrder: ReadiumLink[] | undefined
): string => {
  if (!readingOrder || !readingOrder.length) {
    throw new Error('A manifest has been returned, but has no reading order');
  }

  // If it has no children, return the link href
  return readingOrder[index].href;
};

export const fetchAsUint8Array = async (
  resourceUrl: string,
  proxyUrl?: string
): Promise<PdfFileType> => {
  // Generate the resource URL using the proxy
  const url: string = proxyUrl
    ? `${proxyUrl}${encodeURIComponent(resourceUrl)}`
    : resourceUrl;
  const response = await fetch(url, { mode: 'cors' });
  const array = new Uint8Array(await response.arrayBuffer());

  if (!response.ok) {
    throw new Error('Response not Ok for URL: ' + url);
  }
  return { data: array };
};

/**
 * Gets the index of the provided href in the readingOrder, or throws an error if one
 * is not found.
 */
export function getIndexFromHref(
  href: string,
  manifest: WebpubManifest
): number {
  const input = new URL(href);
  const index = manifest?.readingOrder?.findIndex((link) => {
    return doHrefsMatch(link.href, input);
  });
  if (index < 0) {
    throw new Error(`Cannot find resource in readingOrder: ${href}`);
  }
  return index;
}

/**
 * Compares two hrefs without query params or hash
 */
export function doHrefsMatch(
  href1: string | URL,
  href2: string | URL
): boolean {
  const input1 = new URL(href1);
  const input2 = new URL(href2);
  return (
    input1.pathname === input2.pathname &&
    input1.hostname === input2.hostname &&
    input1.protocol === input2.protocol
  );
}

/**
 * Extracts a start page from a href if it exists and is in the format
 * `?startPage=1`. Returns undefined if none found.
 */
export const getStartPageFromHref = (href: string): number | undefined => {
  const params = new URL(href).searchParams;
  const startPage = params.get(START_QUERY);
  return startPage ? parseInt(startPage) : undefined;
};

/**
 * Extracts a page number from a href if it exists and is in
 * the format of `#page=1`
 */
export const getPageNumberFromHref = (href: string): number | undefined => {
  const hash = new URL(href).hash;
  try {
    const strPageNumber = hash.replace('#page=', '');
    if (!strPageNumber || strPageNumber === 'NaN') return undefined;
    const pageNumber = parseInt(strPageNumber);
    return pageNumber;
  } catch (e) {
    console.warn(`Failed to parse page number from hash ${hash}`);
    return undefined;
  }
};
