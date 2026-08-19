import { GlobalWorkerOptions, version } from 'pdfjs-dist';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_FIT_MODE,
  DEFAULT_HEIGHT,
  DEFAULT_SETTINGS,
} from '../constants';
import {
  PdfNavigator,
  ReaderReturn,
  ReaderState,
  WebpubManifest,
} from '../types';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import './PdfReader.css';
import PdfReaderContent from './PdfReaderContent';
import { PdfReaderAction, pdfReaderReducer, PdfReaderState } from './reducer';
import { OutlineItem, PdfReaderProps } from './types';
import {
  getManifestTitle,
  getManifestTocFromOutline,
  getPageNumberFromHref,
  resolveResourceUrl,
} from './utils';

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

const usePdfReader = ({
  webpubManifestUrl,
  manifest: inputManifest,
  proxyUrl,
  pdfWorkerSrc,
  height = DEFAULT_HEIGHT,
  toggleFullScreen,
}: PdfReaderProps): Exclude<ReaderReturn, null> => {
  // Resolve fileUrl from manifest
  const fileUrl = useMemo(() => {
    if (webpubManifestUrl && inputManifest) {
      return resolveResourceUrl(inputManifest, proxyUrl);
    }
    return undefined;
  }, [webpubManifestUrl, inputManifest, proxyUrl]);

  // Extract initial page from resource href if present
  const resolvedInitialPage = useMemo(() => {
    if (webpubManifestUrl && inputManifest) {
      const originalHref = inputManifest?.readingOrder?.[0]?.href;
      if (originalHref) {
        const pageFromUrl = getPageNumberFromHref(originalHref);
        if (pageFromUrl) return pageFromUrl;
      }
    }
    return 1;
  }, [webpubManifestUrl, inputManifest]);

  const [viewerState, dispatch] = useReducer(pdfReaderReducer, {
    pageNumber: resolvedInitialPage,
    numPages: 0,
    scale: 1,
    fitMode: DEFAULT_FIT_MODE,
    rotation: 0,
    navigationRequestId: 0,
  } satisfies PdfReaderState);
  const {
    pageNumber,
    numPages,
    scale,
    fitMode,
    rotation,
    navigationRequestId,
  } = viewerState;
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [pendingAction, setPendingAction] = useState<PdfReaderAction | null>(
    null
  );
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);
  const [pageSizesReady, setPageSizesReady] = useState(false);
  const hasNavigatedToInitialPageRef = useRef(false);

  useEffect(() => {
    setPdfLoadFailed(false);
    setPageSizesReady(false);
    hasNavigatedToInitialPageRef.current = false;
  }, [fileUrl]);

  const wrappedOnPageSizesReady = useCallback(() => {
    setPageSizesReady(true);
  }, []);

  useEffect(() => {
    if (
      pageSizesReady &&
      numPages > 0 &&
      !hasNavigatedToInitialPageRef.current
    ) {
      hasNavigatedToInitialPageRef.current = true;
      const validPage = Math.min(Math.max(resolvedInitialPage, 1), numPages);
      dispatch({ type: 'GO_TO_PAGE', page: validPage });
    }
  }, [pageSizesReady, numPages, resolvedInitialPage]);

  const clearPendingAction = useCallback(() => setPendingAction(null), []);

  const state: ReaderState = useMemo(
    () => ({
      atStart: pageNumber <= 1,
      atEnd: pageNumber >= numPages,
      settings: DEFAULT_SETTINGS,
      fitMode: fitMode ?? DEFAULT_FIT_MODE,
      rotation,
    }),
    [fitMode, numPages, pageNumber, rotation]
  );

  const navigator: PdfNavigator = useMemo(
    () => ({
      goForward: () => dispatch({ type: 'GO_FORWARD' }),
      goBackward: () => dispatch({ type: 'GO_BACKWARD' }),
      setScroll: async () => undefined,
      goToPage: (href: string) => dispatch({ type: 'GO_TO_HREF', href }),
      goToPageNumber: (page: number) => dispatch({ type: 'GO_TO_PAGE', page }),
      setFitMode: (mode) => dispatch({ type: 'SET_FIT', mode }),
      zoomIn: async () => setPendingAction({ type: 'ZOOM_IN' }),
      zoomOut: async () => setPendingAction({ type: 'ZOOM_OUT' }),
      rotateCounterClockwise: () => setPendingAction({ type: 'ROTATE_CCW' }),
    }),
    []
  );

  const fileName: string | undefined = undefined;
  const manifestTitle = getManifestTitle('PDF Document', fileName);

  const manifest: WebpubManifest = useMemo(() => {
    if (inputManifest) {
      return {
        ...inputManifest,
        toc:
          outline.length > 0
            ? getManifestTocFromOutline(outline)
            : (inputManifest.toc ?? []),
      };
    }
    return {
      metadata: {
        title: manifestTitle,
      },
      links: [],
      readingOrder: [],
      toc: getManifestTocFromOutline(outline),
    };
  }, [inputManifest, manifestTitle, outline]);

  const hasSource = !!fileUrl;
  const isDocLoading = hasSource && !pageSizesReady && !pdfLoadFailed;
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  const content = (
    <div style={{ position: 'relative', height: heightValue }}>
      {isDocLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <LoadingSkeleton height="100%" state={null} />
        </div>
      )}
      <PdfReaderContent
        fileUrl={fileUrl}
        pdfWorkerSrc={pdfWorkerSrc}
        pageNumber={pageNumber}
        navigationRequestId={navigationRequestId}
        scale={scale}
        fitMode={fitMode}
        rotation={rotation}
        dispatch={dispatch}
        pendingAction={pendingAction}
        clearPendingAction={clearPendingAction}
        onOutlineLoad={setOutline}
        onPageSizesReady={wrappedOnPageSizesReady}
      />
    </div>
  );

  return {
    type: 'PDF',
    isLoading: isDocLoading,
    content,
    state,
    navigator,
    manifest,
    currentPage: pageNumber,
    totalPages: numPages,
    toggleFullScreen,
  };
};

export default usePdfReader;
