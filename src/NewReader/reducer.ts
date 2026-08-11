import { MAX_SCALE, MIN_SCALE, SCALE_STEP } from './constants';
import { FitMode } from './types';

export type PdfReaderState = {
  pageNumber: number;
  numPages: number;
  scale: number;
  fitMode: FitMode;
  rotation: number;
  navigationRequestId: number;
};

export type PdfReaderAction =
  | { type: 'GO_FORWARD' }
  | { type: 'GO_BACKWARD' }
  | { type: 'GO_TO_PAGE'; page: number }
  | { type: 'GO_TO_HREF'; href: string }
  | { type: 'PAGE_IN_VIEW'; page: number }
  | { type: 'PAGES_LOADED'; numPages: number }
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'ROTATE_CCW'; nextScale?: number }
  | { type: 'SET_FIT'; mode: FitMode }
  | { type: 'SET_SCALE'; scale: number };

function handleInvalidTransition(
  state: PdfReaderState,
  action: PdfReaderAction
): PdfReaderState {
  console.trace(
    `Invalid state transition attempted with action: ${action.type}`
  );
  return state;
}

export function pdfReaderReducer(
  state: PdfReaderState,
  action: PdfReaderAction
): PdfReaderState {
  switch (action.type) {
    case 'GO_FORWARD': {
      const next = state.pageNumber + 1;
      if (next > state.numPages) return state;
      return {
        ...state,
        pageNumber: next,
        navigationRequestId: state.navigationRequestId + 1,
      };
    }

    case 'GO_BACKWARD': {
      const prev = state.pageNumber - 1;
      if (prev < 1) return state;
      return {
        ...state,
        pageNumber: prev,
        navigationRequestId: state.navigationRequestId + 1,
      };
    }

    case 'GO_TO_PAGE': {
      const numPages = state.numPages || 1;
      const page = Math.max(1, Math.min(action.page, numPages));
      if (page === state.pageNumber) return state;
      return {
        ...state,
        pageNumber: page,
        navigationRequestId: state.navigationRequestId + 1,
      };
    }

    case 'GO_TO_HREF': {
      const parsed = parseInt(action.href, 10);
      if (Number.isNaN(parsed)) return handleInvalidTransition(state, action);
      const numPages = state.numPages || 1;
      const page = Math.max(1, Math.min(parsed, numPages));
      return {
        ...state,
        pageNumber: page,
        navigationRequestId: state.navigationRequestId + 1,
      };
    }

    case 'PAGE_IN_VIEW': {
      if (state.pageNumber === action.page) return state;
      return { ...state, pageNumber: action.page };
    }

    case 'PAGES_LOADED':
      return { ...state, numPages: action.numPages };

    case 'ZOOM_IN':
      return {
        ...state,
        fitMode: null,
        scale: Math.min(MAX_SCALE, +(state.scale + SCALE_STEP).toFixed(2)),
      };

    case 'ZOOM_OUT':
      return {
        ...state,
        fitMode: null,
        scale: Math.max(MIN_SCALE, +(state.scale - SCALE_STEP).toFixed(2)),
      };

    case 'ROTATE_CCW':
      return {
        ...state,
        rotation: (state.rotation + 270) % 360,
        scale: action.nextScale ?? state.scale,
      };

    case 'SET_FIT':
      return { ...state, fitMode: action.mode };

    case 'SET_SCALE':
      return { ...state, scale: action.scale };
  }
}
