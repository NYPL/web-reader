import type { PDFDocumentProxy } from 'pdfjs-dist';
import { WebpubManifest } from '../types';
import { ReadiumLink } from '../WebpubManifestTypes/ReadiumLink';
import { PAGE_GAP } from './constants';
import {
  OutlineItem,
  PageSize,
  PdfBinaryInput,
  PdfOutlineEntry,
  RefProxy,
} from './types';

export const toError = (err: unknown, fallbackMessage: string): Error => {
  if (err instanceof Error) return err;
  return new Error(fallbackMessage);
};

export const toWorkerSafePdfBytes = async (
  input: PdfBinaryInput
): Promise<Uint8Array> => {
  if (input instanceof Blob) {
    return new Uint8Array(await input.arrayBuffer());
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input.slice(0));
  }

  return new Uint8Array(input);
};

export const getRotatedSize = (base: PageSize, rotation: number): PageSize => {
  return rotation % 180 !== 0
    ? { width: base.height, height: base.width }
    : base;
};

export const getDisplayPageHeight = (
  pageBaseSizes: PageSize[],
  pageNumber: number,
  scale: number,
  rotation: number
): number => {
  const base = pageBaseSizes[pageNumber - 1];
  if (!base) return 0;
  const rotated = getRotatedSize(base, rotation);
  return rotated.height * scale;
};

export const getPageTop = (
  pageBaseSizes: PageSize[],
  pageNumber: number,
  scale: number,
  rotation: number
): number => {
  let top = PAGE_GAP;
  for (let i = 1; i < pageNumber; i += 1) {
    top += getDisplayPageHeight(pageBaseSizes, i, scale, rotation) + PAGE_GAP;
  }
  return top;
};

/**
 * Recursively resolves a pdf.js outline (TOC) into page numbers.
 */
export const resolveOutline = async (
  pdfDoc: PDFDocumentProxy,
  items: PdfOutlineEntry[]
): Promise<OutlineItem[]> => {
  const resolved: OutlineItem[] = [];
  for (const item of items) {
    let pageNumber: number | null = null;
    try {
      let dest = item.dest;
      if (typeof dest === 'string') {
        dest = await pdfDoc.getDestination(dest);
      }
      if (Array.isArray(dest)) {
        const pageRef = dest[0] as RefProxy;
        const pageIndex = await pdfDoc.getPageIndex(pageRef);
        pageNumber = pageIndex + 1;
      }
    } catch {
      // Some destinations can't be resolved (e.g. external links), skip.
    }
    resolved.push({
      title: item.title,
      pageNumber,
      items: item.items?.length ? await resolveOutline(pdfDoc, item.items) : [],
    });
  }

  return resolved;
};

export const getManifestTitle = (fallback: string, title?: string): string => {
  if (!title || !title.trim()) return fallback;
  return title.trim();
};

export const getManifestTocFromOutline = (
  outline: OutlineItem[]
): ReadiumLink[] => {
  return outline
    .filter((item) => item.pageNumber != null)
    .map((item) => ({
      href: String(item.pageNumber),
      title: item.title,
    }));
};

export const resolveResourceUrl = (
  manifest: WebpubManifest,
  proxyUrl?: string
): string => {
  const href = manifest?.readingOrder?.[0]?.href;
  if (!href) {
    throw new Error('Unable to resolve a PDF file URL from manifest');
  }
  return proxyUrl ? `${proxyUrl}${encodeURIComponent(href)}` : href;
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
