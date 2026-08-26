import { pdfReaderReducer, PdfReaderState } from '../src/PdfReader/reducer';

const baseState: PdfReaderState = {
  pageNumber: 1,
  numPages: 0,
  scale: 1,
  fitMode: 'width',
  rotation: 0,
  navigationRequestId: 0,
};

describe('pdfReaderReducer — GO_FORWARD', () => {
  it('advances to the next page', () => {
    const state = { ...baseState, pageNumber: 5, numPages: 100 };
    const result = pdfReaderReducer(state, { type: 'GO_FORWARD' });
    expect(result.pageNumber).toBe(6);
    expect(result.navigationRequestId).toBe(1);
  });

  it('does not advance past the last page', () => {
    const state = { ...baseState, pageNumber: 100, numPages: 100 };
    const result = pdfReaderReducer(state, { type: 'GO_FORWARD' });
    expect(result.pageNumber).toBe(100);
    expect(result.navigationRequestId).toBe(0);
  });
});

describe('pdfReaderReducer — GO_BACKWARD', () => {
  it('goes back a page', () => {
    const state = { ...baseState, pageNumber: 5, numPages: 100 };
    const result = pdfReaderReducer(state, { type: 'GO_BACKWARD' });
    expect(result.pageNumber).toBe(4);
    expect(result.navigationRequestId).toBe(1);
  });

  it('does not go below page 1', () => {
    const state = { ...baseState, pageNumber: 1, numPages: 100 };
    const result = pdfReaderReducer(state, { type: 'GO_BACKWARD' });
    expect(result.pageNumber).toBe(1);
    expect(result.navigationRequestId).toBe(0);
  });
});

describe('pdfReaderReducer — GO_TO_PAGE', () => {
  it('navigates to a valid page', () => {
    const state = { ...baseState, pageNumber: 1, numPages: 100 };
    const result = pdfReaderReducer(state, { type: 'GO_TO_PAGE', page: 42 });
    expect(result.pageNumber).toBe(42);
    expect(result.navigationRequestId).toBe(1);
  });

  it('navigates to last page when pageNumber is -1', () => {
    const state = { ...baseState, pageNumber: 50, numPages: 100 };
    const result = pdfReaderReducer(state, { type: 'GO_TO_PAGE', page: -1 });
    expect(result.pageNumber).toBe(1);
  });
});

describe('pdfReaderReducer — PAGE_IN_VIEW', () => {
  it('updates the current page without bumping navigationRequestId', () => {
    const state = { ...baseState, pageNumber: 1, numPages: 100 };
    const result = pdfReaderReducer(state, {
      type: 'PAGE_IN_VIEW',
      page: 7,
    });
    expect(result.pageNumber).toBe(7);
    expect(result.navigationRequestId).toBe(0);
  });

  it('is a no-op when already on that page', () => {
    const state = { ...baseState, pageNumber: 7, numPages: 100 };
    const result = pdfReaderReducer(state, {
      type: 'PAGE_IN_VIEW',
      page: 7,
    });
    expect(result).toBe(state);
  });
});

describe('pdfReaderReducer — PAGES_LOADED', () => {
  it('sets numPages', () => {
    const result = pdfReaderReducer(baseState, {
      type: 'PAGES_LOADED',
      numPages: 250,
    });
    expect(result.numPages).toBe(250);
  });
});

describe('pdfReaderReducer — ZOOM_IN / ZOOM_OUT', () => {
  it('increases scale and clears fitMode', () => {
    const state = { ...baseState, scale: 1, fitMode: 'width' as const };
    const result = pdfReaderReducer(state, { type: 'ZOOM_IN' });
    expect(result.scale).toBeCloseTo(1.1);
    expect(result.fitMode).toBeNull();
  });

  it('does not zoom in past the max scale', () => {
    const state = { ...baseState, scale: 5, fitMode: null };
    const result = pdfReaderReducer(state, { type: 'ZOOM_IN' });
    expect(result.scale).toBe(5);
  });

  it('decreases scale and clears fitMode', () => {
    const state = { ...baseState, scale: 1, fitMode: 'width' as const };
    const result = pdfReaderReducer(state, { type: 'ZOOM_OUT' });
    expect(result.scale).toBeCloseTo(0.9);
    expect(result.fitMode).toBeNull();
  });

  it('does not zoom out past the min scale', () => {
    const state = { ...baseState, scale: 0.25, fitMode: null };
    const result = pdfReaderReducer(state, { type: 'ZOOM_OUT' });
    expect(result.scale).toBe(0.25);
  });
});

describe('pdfReaderReducer — ROTATE_CCW', () => {
  it('rotates counter-clockwise by 270 degrees, wrapping at 360', () => {
    const state = { ...baseState, rotation: 90 };
    const result = pdfReaderReducer(state, { type: 'ROTATE_CCW' });
    expect(result.rotation).toBe(0);
  });

  it('applies an explicit nextScale when provided', () => {
    const state = { ...baseState, rotation: 0, scale: 1 };
    const result = pdfReaderReducer(state, {
      type: 'ROTATE_CCW',
      nextScale: 1.5,
    });
    expect(result.rotation).toBe(270);
    expect(result.scale).toBe(1.5);
  });
});

describe('pdfReaderReducer — SET_FIT / SET_SCALE', () => {
  it('sets the fit mode', () => {
    const result = pdfReaderReducer(baseState, {
      type: 'SET_FIT',
      mode: 'height',
    });
    expect(result.fitMode).toBe('height');
  });

  it('sets the scale', () => {
    const result = pdfReaderReducer(baseState, {
      type: 'SET_SCALE',
      scale: 2,
    });
    expect(result.scale).toBe(2);
  });
});
