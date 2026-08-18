import { Dispatch } from 'react';
import { WebpubManifest } from '../types';
import { PdfReaderAction } from './reducer';

export type FitMode = 'width' | 'height' | null;

export interface OutlineItem {
  title: string;
  pageNumber: number | null;
  items: OutlineItem[];
}

export interface PageSize {
  width: number;
  height: number;
}

export interface ViewportAnchor {
  pageNumber: number;
  intraPageRatio: number;
  viewportOffset: number;
}

export interface PdfReaderProps {
  fileUrl?: string;
  webpubManifestUrl?: string;
  manifest?: WebpubManifest;
  proxyUrl?: string;
  pdfWorkerSrc?: string;
  height?: string | number;
  className?: string;
  toggleFullScreen?: () => void;
}

export interface PdfReaderContentProps {
  fileUrl: string | undefined;
  pdfWorkerSrc?: string;
  pageNumber: number;
  navigationRequestId: number;
  scale: number;
  fitMode: FitMode;
  rotation: number;
  dispatch: Dispatch<PdfReaderAction>;
  pendingAction: PdfReaderAction | null;
  clearPendingAction: () => void;
  onOutlineLoad: (outlineItems: OutlineItem[]) => void;
  onPageSizesReady?: () => void;
}

export interface RenderTask {
  promise: Promise<unknown>;
  cancel: () => void;
}

export interface PdfOutlineEntry {
  title: string;
  dest: string | unknown[] | null;
  items?: PdfOutlineEntry[];
}

export type RefProxy = import('pdfjs-dist/types/src/display/api').RefProxy;

export type PdfBinaryInput = Blob | File | Uint8Array | ArrayBuffer;
