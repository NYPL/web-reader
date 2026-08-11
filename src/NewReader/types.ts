import { PDFDocumentProxy } from 'pdfjs-dist';
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
  file?: Blob | File | Uint8Array | ArrayBuffer;
  data?: Uint8Array | ArrayBuffer;
  webpubManifestUrl?: string;
  manifest?: WebpubManifest;
  proxyUrl?: string;
  pdfWorkerSrc?: string;
  height?: string | number;
  initialPage?: number;
  initialScale?: number;
  initialFit?: FitMode;
  showToc?: boolean;
  className?: string;
  onDocumentLoad?: (pdfDoc: PDFDocumentProxy) => void;
  onLoadComplete?: (numPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
  onError?: (error: Error) => void;
  toggleFullScreen?: () => void;
}

export interface PdfReaderContentProps {
  fileUrl?: string;
  file?: Blob | File | Uint8Array | ArrayBuffer;
  data?: Uint8Array | ArrayBuffer;
  pdfWorkerSrc?: string;
  className?: string;
  onDocumentLoad?: (pdfDoc: PDFDocumentProxy) => void;
  onLoadComplete?: (numPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
  onError?: (error: Error) => void;
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
