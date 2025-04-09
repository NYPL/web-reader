import { Injectable } from './Readium/Injectable';
import { Locator } from './Readium/Locator';
import { WebpubManifest } from './WebpubManifestTypes/WebpubManifest';
import { File as PdfFileType } from 'react-pdf/dist/cjs/shared/types';

export { WebpubManifest };

export { PdfFileType };

// the MimeType for a packaged epub
export const EpubMimeType = 'application/epub';
// the Mimetype for a generic webpub
export const WebpubMimeType = 'application/webpub';

export type ColorMode = 'night' | 'sepia' | 'day';

export type FontFamily = 'publisher' | 'serif' | 'sans-serif' | 'open-dyslexic';

export type Navigator = {
  goForward: () => void;
  goBackward: () => void;
  setScroll: (val: 'scrolling' | 'paginated') => Promise<void>;
  goToPage: (href: string) => void;
};

export type PdfNavigator = Navigator & {
  zoomIn: () => Promise<void>;
  zoomOut: () => Promise<void>;
};

export type HtmlNavigator = Navigator & {
  increaseFontSize: () => Promise<void>;
  decreaseFontSize: () => Promise<void>;
  resetSettings: () => Promise<void>;
  setFontFamily: (family: FontFamily) => Promise<void>;
  setColorMode: (mode: ColorMode) => Promise<void>;
};

export type ReaderSettings = {
  colorMode: ColorMode;
  isScrolling: boolean;
  fontSize: number;
  fontFamily: FontFamily;
};

/**
 * This is the "public" state of the reader that
 * is returned to consumers of useWebReader. Each
 * reader (pdf/html) has its own internal state with
 * more details necessary for rendering
 */
export type ReaderState = {
  atStart: boolean;
  atEnd: boolean;
  location?: Locator;
  settings: ReaderSettings | undefined;
};

export type InactiveReader = null;

export type LoadingReader = {
  isLoading: true;
  content: JSX.Element;
  navigator: null;
  state: null;
  manifest: null;
  type: null;
};

type CommonReader = {
  isLoading: false;
  content: JSX.Element;
  manifest: WebpubManifest;
};

export type PDFActiveReader = CommonReader & {
  state: ReaderState;
  navigator: PdfNavigator;
  type: 'PDF';
};

export type HTMLActiveReader = CommonReader & {
  state: ReaderState;
  navigator: HtmlNavigator;
  type: 'HTML';
};

export type ActiveReader = PDFActiveReader | HTMLActiveReader;

export type ReaderReturn = InactiveReader | LoadingReader | ActiveReader;

// should fetch and decrypt a resource
export type GetContent<T extends Uint8Array | PdfFileType> = (
  href: string,
  proxyUrl?: string
) => Promise<T>;

export type ReaderManagerArguments = {
  headerLeft?: JSX.Element; // Top-left header section
};

export type UseWebReaderArguments<T extends Uint8Array | PdfFileType> = {
  webpubManifestUrl: string;
  proxyUrl?: string;
  getContent?: GetContent<T>;
  pdfWorkerSrc?: string;
  injectablesReflowable?: Injectable[];
  injectablesFixed?: Injectable[];
  /**
   * CSS string to set the height of the reader in paginated mode, and also
   * in scrolling mode if `growWhenScrolling` is `false`.
   *
   * eg: "800px" or `calc(100vh-${CHROME_HEIGHT})`
   *
   * Default: `calc(100vh-${CHROME_HEIGHT})`
   */
  height?: string;
  /**
   * Tells the renderer if it should grow to fit content in scrolling mode, or if should
   * remain the same height and instead show an internal scroll bar. Set to `true` by
   * default, as this should be used in a full-page reader, the most common use case.
   *
   * Default: `true`
   */
  growWhenScrolling?: boolean;
  /**
   * Initial user settings for the reader
   */
  readerSettings?: Partial<ReaderSettings>;
  /**
   * If enabled, reading location will be persisted to local storage and recalled from
   * there upon initial load.
   *
   * Default: `true`
   */
  persistLastLocation?: boolean;
  /**
   * If enabled, reader settings will be persisted to local storage and recalled
   * from there upon initial load.
   *
   * Default: `true`
   */
  persistSettings?: boolean;
};

export type ActiveReaderArguments<
  T extends Uint8Array | PdfFileType
> = UseWebReaderArguments<T> & {
  manifest: WebpubManifest;
};

export type InactiveReaderArguments = undefined;

export type GetColor = (light: string, dark: string, sepia: string) => string;
