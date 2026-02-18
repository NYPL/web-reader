import React from 'react';
import {
  ActiveReader,
  ColorMode,
  FitMode,
  FontFamily,
  HtmlNavigator,
  Navigator,
  PdfNavigator,
  WebpubManifest,
} from '../../src/types';
import { HtmlSettingsProps } from '../../src/ui/HtmlSettings';

const goForwardFn = jest.fn();
const goBackwardFn = jest.fn();
const setColorModeFn = jest.fn();
const setScrollFn = jest.fn();
const increaseFontSizeFn = jest.fn();
const decreaseFontSizeFn = jest.fn();
const resetSettingsFn = jest.fn();
const zoomInFn = jest.fn();
const zoomOutFn = jest.fn();
const setFontFamilyFn = jest.fn();
const goToPageFn = jest.fn();
const goToPageNumberFn = jest.fn();
const setFitModeFn = jest.fn();
const rotateCounterClockwiseFn = jest.fn();

export const MockNavigator = {
  goForward: goForwardFn,
  goBackward: goBackwardFn,
  setColorMode: setColorModeFn,
  setScroll: setScrollFn,
  increaseFontSize: increaseFontSizeFn,
  decreaseFontSize: decreaseFontSizeFn,
  setFontFamily: setFontFamilyFn,
  goToPage: goToPageFn,
  goToPageNumber: goToPageNumberFn,
  resetSettings: resetSettingsFn,
  setFitMode: setFitModeFn,
} as Navigator;

export const MockHtmlNavigator = {
  goForward: goForwardFn,
  goBackward: goBackwardFn,
  setColorMode: setColorModeFn,
  setScroll: setScrollFn,
  increaseFontSize: increaseFontSizeFn,
  decreaseFontSize: decreaseFontSizeFn,
  resetSettings: resetSettingsFn,
  setFontFamily: setFontFamilyFn,
  goToPage: goToPageFn,
  goToPageNumber: goToPageNumberFn,
  setFitMode: setFitModeFn,
} as HtmlNavigator;

export const MockPdfNavigator = {
  goForward: goForwardFn,
  goBackward: goBackwardFn,
  setColorMode: setColorModeFn,
  setScroll: setScrollFn,
  zoomIn: zoomInFn,
  zoomOut: zoomOutFn,
  setFontFamily: setFontFamilyFn,
  goToPage: goToPageFn,
  goToPageNumber: goToPageNumberFn,
  resetSettings: resetSettingsFn,
  setFitMode: setFitModeFn,
  rotateCounterClockwise: rotateCounterClockwiseFn,
} as PdfNavigator;

export const MockWebpubManifest = {
  readingOrder: [
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap0000.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00001.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap0002.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00003.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00003-1.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00004-1.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00004-2.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00004-2-1.html',
    },
    {
      type: 'application/xhtml+xml',
      href: 'OEBPS/wrap00004-3-1.html',
    },
  ],
  toc: [
    {
      title: 'Chapter 1',
      href: 'chapter/one/url',
    },
    {
      title: 'Chapter 2',
      href: 'chapter/two/url',
    },
    {
      title: 'Chapter 3',
      href: 'chapter/three/url',
      children: [
        {
          title: 'Chapter 3 part 1',
          href: 'chapter/three_one/url',
        },
      ],
    },
    {
      title: 'Chapter 4',
      href: '',
      children: [
        {
          title: 'Chapter 4 part 1',
          href: 'chapter/four/one/url',
        },
        {
          title: 'Chapter 4 part 2',
          href: 'chapter/four/two/url',
          children: [
            {
              title: 'Chapter 4 part 2.1',
              href: 'chapter/four/two/one/url',
            },
          ],
        },
        {
          title: 'Chapter 4 part 3',
          href: '',
          children: [
            {
              title: 'Chapter 4 part 3.1',
              href: 'chapter/four/three/one/url',
            },
          ],
        },
      ],
    },
  ],
} as WebpubManifest;

const MockComponent = (): React.ReactElement => <>Hello, world.</>;

export const MockHtmlReaderState = {
  settings: {
    colorMode: 'day' as ColorMode,
    isScrolling: false,
    fontSize: 16,
    fontFamily: 'sans-serif' as FontFamily,
    reader: undefined,
    currentTocUrl: null,
  },
  atStart: true,
  atEnd: false,
  fitMode: 'height' as FitMode,
};

const MockPdfReaderState = {
  settings: {
    colorMode: 'day' as ColorMode,
    isScrolling: false,
    fontSize: 16,
    fontFamily: 'sans-serif' as FontFamily,
  },
  resourceIndex: 0,
  file: null,
  pageNumber: 1,
  numPages: null,
  currentTocUrl: null,
  atStart: true,
  atEnd: false,
};

export const MockHtmlSettingsProps = ({
  navigator: MockHtmlNavigator,
  readerState: MockHtmlReaderState,
  paginationValue: 'scrolling',
} as unknown) as HtmlSettingsProps;

export const MockHtmlReaderProps = ({
  type: 'HTML',
  isLoading: false,
  content: <MockComponent />,
  state: MockHtmlReaderState,
  manifest: MockWebpubManifest,
  navigator: MockHtmlNavigator,
} as unknown) as ActiveReader;

export const MockPdfReaderProps = ({
  type: 'PDF',
  isLoading: false,
  content: <MockComponent />,
  state: MockPdfReaderState,
  manifest: MockWebpubManifest,
  navigator: MockPdfNavigator,
} as unknown) as ActiveReader;
