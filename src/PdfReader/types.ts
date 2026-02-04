import {
  ActiveReaderArguments,
  FitMode,
  InactiveReaderArguments,
  ReaderSettings,
  ReaderState,
} from '../types';

export type InternalState = {
  resourceIndex: number;
  resource: { data: Uint8Array } | null;
  // we only know the numPages once the resource has been parsed
  numPages: number | null;
  // if pageNumber is -1, we will navigate to the end of the
  // resource once it is parsed
  pageNumber: number;
  scale: number;
  pdfHeight: number;
  pdfWidth: number;
  pageHeight: number | undefined;
  pageWidth: number | undefined;
  rendered: boolean;
};

export type InactiveState = ReaderState &
  InternalState & { state: 'INACTIVE'; settings: undefined };

export type ActiveState = ReaderState &
  InternalState & { state: 'ACTIVE'; settings: ReaderSettings };

export type ErrorState = ReaderState &
  InternalState & {
    state: 'ERROR';
    error: Error;
    settings: ReaderSettings;
  };

export type PdfState = InactiveState | ActiveState | ErrorState;

export type PdfReaderArguments =
  | ActiveReaderArguments<Uint8Array>
  | InactiveReaderArguments;

export type PdfReaderAction =
  | {
      type: 'ARGS_CHANGED';
      args: PdfReaderArguments;
    }
  | { type: 'GO_FORWARD' }
  | { type: 'GO_BACKWARD' }
  | { type: 'GO_TO_HREF'; href: string }
  | { type: 'GO_TO_PAGE'; page: number }
  | { type: 'PAGE_IN_VIEW'; page: number }
  | { type: 'RESOURCE_FETCH_SUCCESS'; resource: { data: Uint8Array } }
  | { type: 'PDF_PARSED'; numPages: number }
  | { type: 'PDF_LOAD_ERROR'; error: Error }
  | { type: 'SET_SCALE'; scale: number }
  // | { type: 'RESET_SETTINGS' } may be needed in future
  | { type: 'SET_SCROLL'; isScrolling: boolean }
  | { type: 'PAGE_LOAD_SUCCESS'; height: number; width: number }
  | {
      type: 'RESIZE_PAGE';
      height: number | undefined;
      width: number | undefined;
    }
  | { type: 'SET_FIT_MODE'; fitMode: FitMode }
  | { type: 'ROTATE_LEFT' }
  | { type: 'BOOK_BOUNDARY_CHANGED'; atStart: boolean; atEnd: boolean };
