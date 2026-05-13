import { makePdfReducer } from '../src/PdfReader/reducer';
import { PdfReaderArguments, PdfState } from '../src/PdfReader/types';
import { DEFAULT_FIT_MODE, DEFAULT_SETTINGS } from '../src/constants';

function makeArgs(href: string): PdfReaderArguments {
  return {
    manifest: {
      metadata: { title: 'Test' },
      readingOrder: [{ href, type: 'application/pdf' }],
    },
  } as unknown as PdfReaderArguments;
}

const baseState: PdfState = {
  state: 'ACTIVE',
  settings: DEFAULT_SETTINGS,
  resourceIndex: 0,
  resource: null,
  pageNumber: 1,
  numPages: null,
  scale: 1,
  pdfWidth: 0,
  pdfHeight: 0,
  pageHeight: undefined,
  pageWidth: undefined,
  atStart: true,
  atEnd: false,
  rendered: false,
  fitMode: DEFAULT_FIT_MODE,
  rotation: 0,
};

describe('makePdfReducer — PDF_PARSED', () => {
  it('keeps page 1 when no start query param is present', () => {
    const args = makeArgs('https://example.com/doc.pdf');
    const reducer = makePdfReducer(args);
    const state = reducer(baseState, { type: 'PDF_PARSED', numPages: 100 });
    expect(state.pageNumber).toBe(1);
  });

  it('jumps to start on initial load when pageNumber is below start', () => {
    const args = makeArgs('https://example.com/doc.pdf?start=15');
    const reducer = makePdfReducer(args);
    const state = reducer(baseState, { type: 'PDF_PARSED', numPages: 100 });
    expect(state.pageNumber).toBe(15);
  });

  it('does not override pageNumber when user has already navigated past start', () => {
    const args = makeArgs('https://example.com/doc.pdf?start=15');
    const reducer = makePdfReducer(args);
    const navigatedState = { ...baseState, pageNumber: 20 };
    const state = reducer(navigatedState, {
      type: 'PDF_PARSED',
      numPages: 100,
    });
    expect(state.pageNumber).toBe(20);
  });

  it('navigates to last page when pageNumber is -1', () => {
    const args = makeArgs('https://example.com/doc.pdf');
    const reducer = makePdfReducer(args);
    const endState = { ...baseState, pageNumber: -1 };
    const state = reducer(endState, { type: 'PDF_PARSED', numPages: 100 });
    expect(state.pageNumber).toBe(100);
  });
});

describe('makePdfReducer — GO_BACKWARD', () => {
  it('allows navigating back below start page within the same resource', () => {
    const args = makeArgs('https://example.com/doc.pdf?start=5');
    const reducer = makePdfReducer(args);
    const onStartPage = { ...baseState, pageNumber: 5, numPages: 100 };
    const state = reducer(onStartPage, { type: 'GO_BACKWARD' });
    expect(state.pageNumber).toBe(4);
  });

  it('does not go below page 1', () => {
    const args = makeArgs('https://example.com/doc.pdf');
    const reducer = makePdfReducer(args);
    const onFirstPage = { ...baseState, pageNumber: 1, numPages: 100 };
    const state = reducer(onFirstPage, { type: 'GO_BACKWARD' });
    expect(state.pageNumber).toBe(1);
  });
});
