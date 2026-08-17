import { Icon } from '@chakra-ui/react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { DEFAULT_HEIGHT, DEFAULT_SETTINGS } from '../constants';
import {
  PdfNavigator,
  ReaderReturn,
  ReaderState,
  WebpubManifest,
} from '../types';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import PdfPage from './PdfPage';
import './PdfReader.css';
import {
  PAGE_GAP,
  PAGE_PADDING,
  RENDER_ROOT_MARGIN,
  SCROLLSPY_ANCHOR_RATIO,
} from './constants';
import { PdfReaderAction, pdfReaderReducer, PdfReaderState } from './reducer';
import {
  FitMode,
  OutlineItem,
  PageSize,
  PdfOutlineEntry,
  PdfReaderContentProps,
  PdfReaderProps,
  ViewportAnchor,
} from './types';
import {
  getDisplayPageHeight,
  getManifestTitle,
  getManifestTocFromOutline,
  getPageTop,
  getRotatedSize,
  resolveOutline,
  resolveResourceUrl,
  toError,
  toWorkerSafePdfBytes,
} from './utils';

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

export const PdfReader = ({
  fileUrl,
  file,
  data,
  pdfWorkerSrc,
  onDocumentLoad,
  onLoadComplete,
  onPageChange,
  onError,
  pageNumber,
  navigationRequestId,
  scale,
  fitMode,
  rotation,
  dispatch,
  pendingAction,
  clearPendingAction,
  onOutlineLoad,
  onPageSizesReady,
}: PdfReaderContentProps): React.ReactElement => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (pdfWorkerSrc) GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  }, [pdfWorkerSrc]);

  const [pageBaseSizes, setPageBaseSizes] = useState<PageSize[]>([]);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasInitialWidthFit, setHasInitialWidthFit] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportWrapRef = useRef<HTMLDivElement | null>(null);
  const containerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const renderObserverRef = useRef<IntersectionObserver | null>(null);
  const currentPageRef = useRef(pageNumber);
  const pendingScrollTargetRef = useRef<number | null>(null);
  const lastHandledNavigationRequestRef = useRef(0);
  const pendingViewportAnchorRef = useRef<ViewportAnchor | null>(null);
  const initialWidthFitTargetScaleRef = useRef<number | null>(null);
  const suppressNextResizeFitRef = useRef(false);
  const onDocumentLoadRef = useRef(onDocumentLoad);
  const onLoadCompleteRef = useRef(onLoadComplete);
  const onErrorRef = useRef(onError);
  const onPageSizesReadyRef = useRef(onPageSizesReady);

  useEffect(() => {
    onDocumentLoadRef.current = onDocumentLoad;
    onLoadCompleteRef.current = onLoadComplete;
    onErrorRef.current = onError;
    onPageSizesReadyRef.current = onPageSizesReady;
  }, [onDocumentLoad, onLoadComplete, onError, onPageSizesReady]);

  useEffect(() => {
    currentPageRef.current = pageNumber;
  }, [pageNumber]);

  useEffect(() => {
    return () => {
      pdfDoc?.destroy();
    };
  }, [pdfDoc]);

  // Load doc
  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof getDocument> | null = null;
    setLoading(true);
    setError(null);
    setPdfDoc(null);
    onOutlineLoad([]);
    setPageBaseSizes([]);
    setVisiblePages(new Set());
    setHasInitialWidthFit(false);
    initialWidthFitTargetScaleRef.current = null;
    containerRefs.current.clear();

    const loadDocument = async () => {
      try {
        const resolvedFile = file ?? data;

        if (!resolvedFile && !fileUrl) {
          throw new Error('A PDF file/data or fileUrl is required');
        }

        const source = resolvedFile
          ? {
              data: await toWorkerSafePdfBytes(resolvedFile),
            }
          : { url: fileUrl, withCredentials: false };

        loadingTask = getDocument(source);
        const doc = await loadingTask.promise;
        if (cancelled) return;

        setPdfDoc(doc);
        dispatch({ type: 'PAGES_LOADED', numPages: doc.numPages });
        onDocumentLoadRef.current?.(doc);
        onLoadCompleteRef.current?.(doc.numPages);

        try {
          const rawOutline = (await doc.getOutline()) as
            | PdfOutlineEntry[]
            | null;
          if (rawOutline && !cancelled) {
            onOutlineLoad(await resolveOutline(doc, rawOutline));
          }
        } catch {
          // Outline is optional, ignore failures.
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const nextError = toError(err, 'Failed to load PDF document');
        setError(nextError);
        onErrorRef.current?.(nextError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
      loadingTask?.destroy?.();
    };
  }, [fileUrl, file, data, dispatch, onOutlineLoad]);

  // Read every page's intrinsic size to determine scroll container's height
  // before any page has actually been painted.
  // TODO: for very large documents consider windowing this fetch
  useEffect(() => {
    if (!pdfDoc) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const sizes: PageSize[] = [];
        for (let i = 1; i <= pdfDoc.numPages; i += 1) {
          if (cancelled) return;
          const page = await pdfDoc.getPage(i);
          const vp = page.getViewport({ scale: 1, rotation: 0 });
          sizes.push({ width: vp.width, height: vp.height });
          // Hint to pdf.js to release temporary resources for this page.
          page.cleanup();
        }
        if (cancelled) return;
        setPageBaseSizes(sizes);
        onPageSizesReadyRef.current?.();
      } catch (err: unknown) {
        if (cancelled) return;
        const nextError = toError(err, 'Failed to read page dimensions');
        setError(nextError);
        onErrorRef.current?.(nextError);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc]);

  // Lazy render: observe which pages are near the viewport
  useEffect(() => {
    const wrap = viewportWrapRef.current;
    if (!wrap || !pageBaseSizes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prev) => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach((entry) => {
            const pn = Number((entry.target as HTMLElement).dataset.pageNumber);
            if (!pn) return;
            if (entry.isIntersecting && !next.has(pn)) {
              next.add(pn);
              changed = true;
            } else if (!entry.isIntersecting && next.has(pn)) {
              next.delete(pn);
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      },
      { root: wrap, rootMargin: RENDER_ROOT_MARGIN, threshold: 0 }
    );

    renderObserverRef.current = observer;
    containerRefs.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      renderObserverRef.current = null;
    };
  }, [pageBaseSizes.length]);

  const registerContainer = useCallback(
    (pageNumber: number, el: HTMLDivElement | null) => {
      if (el) {
        containerRefs.current.set(pageNumber, el);
        renderObserverRef.current?.observe(el);
      } else {
        const existing = containerRefs.current.get(pageNumber);
        if (existing && renderObserverRef.current) {
          renderObserverRef.current.unobserve(existing);
        }
        containerRefs.current.delete(pageNumber);
      }
    },
    []
  );

  // Scrollspy: derive "current page" from scroll position
  useEffect(() => {
    const wrap = viewportWrapRef.current;
    if (!wrap || !pageBaseSizes.length) return undefined;

    let ticking = false;

    const update = () => {
      ticking = false;
      if (pendingScrollTargetRef.current != null) {
        const targetEl = containerRefs.current.get(
          pendingScrollTargetRef.current
        );
        if (targetEl && Math.abs(targetEl.offsetTop - wrap.scrollTop) < 4) {
          pendingScrollTargetRef.current = null;
        }
      }

      const anchor =
        wrap.scrollTop + wrap.clientHeight * SCROLLSPY_ANCHOR_RATIO;
      let best = currentPageRef.current;
      let bestTop = -Infinity;
      containerRefs.current.forEach((el, pn) => {
        if (el.offsetTop <= anchor && el.offsetTop > bestTop) {
          bestTop = el.offsetTop;
          best = pn;
        }
      });

      if (best !== currentPageRef.current)
        dispatch({ type: 'PAGE_IN_VIEW', page: best });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    wrap.addEventListener('scroll', onScroll);
    update();

    return () => wrap.removeEventListener('scroll', onScroll);
  }, [dispatch, pageBaseSizes.length]);

  useEffect(() => {
    const wrap = viewportWrapRef.current;
    if (!wrap || !pageBaseSizes.length || navigationRequestId <= 0) return;
    if (navigationRequestId === lastHandledNavigationRequestRef.current) return;

    const target = containerRefs.current.get(pageNumber);
    if (!target) return;

    // Ensure the destination page (and immediate neighbors) are considered
    // visible right away so rendering starts before IntersectionObserver settles.
    setVisiblePages((prev) => {
      const next = new Set(prev);
      next.add(pageNumber);
      if (pageNumber > 1) next.add(pageNumber - 1);
      if (pageNumber < pageBaseSizes.length) next.add(pageNumber + 1);
      return next;
    });

    pendingScrollTargetRef.current = pageNumber;
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
    lastHandledNavigationRequestRef.current = navigationRequestId;
  }, [navigationRequestId, pageBaseSizes.length, pageNumber]);

  useEffect(() => {
    onPageChange?.(pageNumber);
  }, [onPageChange, pageNumber]);

  // Viewport anchor capture
  // Records what content is currently visible so that after a layout-affecting
  // change (scale/rotation) the scroll position is restored.
  const captureViewportAnchor = useCallback(() => {
    if (pendingViewportAnchorRef.current) return;

    const wrap = viewportWrapRef.current;
    if (!wrap || !pageBaseSizes.length) return;

    const viewportOffset = wrap.clientHeight * SCROLLSPY_ANCHOR_RATIO;
    const anchorY = wrap.scrollTop + viewportOffset;

    let anchorPage = 1;
    let intraPageRatio = 0;

    for (let i = 1; i <= pageBaseSizes.length; i += 1) {
      const top = getPageTop(pageBaseSizes, i, scale, rotation);
      const height = getDisplayPageHeight(pageBaseSizes, i, scale, rotation);
      if (anchorY <= top + height || i === pageBaseSizes.length) {
        anchorPage = i;
        intraPageRatio = height > 0 ? (anchorY - top) / height : 0;
        break;
      }
    }

    pendingViewportAnchorRef.current = {
      pageNumber: anchorPage,
      intraPageRatio: Math.max(0, Math.min(1, intraPageRatio)),
      viewportOffset,
    };
  }, [pageBaseSizes, scale, rotation]);

  // Fit-to-width/height
  const computeFitScaleValue = useCallback(
    (mode: FitMode, rotationForCalc: number): number | null => {
      if (!mode || !pageBaseSizes.length) return null;
      const wrap = viewportWrapRef.current;
      if (!wrap) return null;

      const refPageNumber = Math.min(
        Math.max(currentPageRef.current, 1),
        pageBaseSizes.length
      );
      const base = pageBaseSizes[refPageNumber - 1];
      const rotated = getRotatedSize(base, rotationForCalc);

      const widestRotatedPageWidth = pageBaseSizes.reduce((maxWidth, page) => {
        const nextWidth = getRotatedSize(page, rotationForCalc).width;
        return Math.max(maxWidth, nextWidth);
      }, 0);

      const availWidth = wrap.clientWidth - PAGE_PADDING;
      const availHeight = wrap.clientHeight - PAGE_PADDING;

      const newScale =
        mode === 'width'
          ? availWidth / widestRotatedPageWidth
          : availHeight / rotated.height;
      return newScale > 0 ? newScale : null;
    },
    [pageBaseSizes]
  );

  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const applyFitScale = useCallback(
    (mode: FitMode) => {
      const newScale = computeFitScaleValue(mode, rotation);
      if (newScale == null) return;

      const relativeDelta =
        scaleRef.current > 0
          ? Math.abs(scaleRef.current - newScale) / scaleRef.current
          : 1;
      if (relativeDelta < 0.005) return;

      captureViewportAnchor();

      suppressNextResizeFitRef.current = true;
      dispatch({ type: 'SET_SCALE', scale: newScale });
    },
    [computeFitScaleValue, rotation, captureViewportAnchor, dispatch]
  );

  useLayoutEffect(() => {
    const anchor = pendingViewportAnchorRef.current;
    const wrap = viewportWrapRef.current;
    if (!anchor || !wrap || !pageBaseSizes.length) return;

    const top = getPageTop(pageBaseSizes, anchor.pageNumber, scale, rotation);
    const height = getDisplayPageHeight(
      pageBaseSizes,
      anchor.pageNumber,
      scale,
      rotation
    );
    const anchorY = top + height * anchor.intraPageRatio;
    const nextScrollTop = Math.max(0, anchorY - anchor.viewportOffset);
    wrap.scrollTop = nextScrollTop;

    pendingViewportAnchorRef.current = null;
  }, [scale, rotation, pageBaseSizes]);

  useEffect(() => {
    if (!pendingAction) return;

    if (pendingAction.type === 'ZOOM_IN' || pendingAction.type === 'ZOOM_OUT') {
      captureViewportAnchor();
      dispatch({ type: pendingAction.type });
    }

    if (pendingAction.type === 'ROTATE_CCW') {
      captureViewportAnchor();

      const nextRotation = (rotation + 270) % 360;
      const nextScale = fitMode
        ? computeFitScaleValue(fitMode, nextRotation)
        : undefined;
      if (nextScale != null) suppressNextResizeFitRef.current = true;
      dispatch({ type: 'ROTATE_CCW', nextScale: nextScale ?? undefined });
    }

    clearPendingAction();
  }, [
    captureViewportAnchor,
    clearPendingAction,
    computeFitScaleValue,
    fitMode,
    pendingAction,
    rotation,
    dispatch,
  ]);

  useEffect(() => {
    if (fitMode) applyFitScale(fitMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitMode, pageBaseSizes]);

  useLayoutEffect(() => {
    if (hasInitialWidthFit) return;
    if (fitMode !== 'width') {
      setHasInitialWidthFit(true);
      return;
    }
    if (!pageBaseSizes.length) return;

    const targetScale = computeFitScaleValue('width', rotation);
    if (targetScale == null) return;

    initialWidthFitTargetScaleRef.current = targetScale;

    const relativeDelta = scale > 0 ? Math.abs(scale - targetScale) / scale : 1;

    if (relativeDelta < 0.005) {
      setHasInitialWidthFit(true);
      initialWidthFitTargetScaleRef.current = null;
      return;
    }

    suppressNextResizeFitRef.current = true;
    dispatch({ type: 'SET_SCALE', scale: targetScale });
  }, [
    computeFitScaleValue,
    dispatch,
    fitMode,
    hasInitialWidthFit,
    pageBaseSizes.length,
    rotation,
    scale,
  ]);

  useEffect(() => {
    if (hasInitialWidthFit) return;
    const targetScale = initialWidthFitTargetScaleRef.current;
    if (targetScale == null) return;

    const relativeDelta =
      targetScale > 0 ? Math.abs(scale - targetScale) / targetScale : 0;
    if (relativeDelta < 0.005) {
      setHasInitialWidthFit(true);
      initialWidthFitTargetScaleRef.current = null;
    }
  }, [hasInitialWidthFit, scale]);

  // Re-apply fit scale on container resize.
  useEffect(() => {
    const wrap = viewportWrapRef.current;
    if (!wrap) return undefined;
    const ro = new ResizeObserver(() => {
      if (suppressNextResizeFitRef.current) {
        suppressNextResizeFitRef.current = false;
        return;
      }
      if (fitMode) applyFitScale(fitMode);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [fitMode, applyFitScale]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!rootRef.current?.contains(document.activeElement)) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        dispatch({ type: 'GO_FORWARD' });
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        dispatch({ type: 'GO_BACKWARD' });
      }
    };
    window.addEventListener('keydown', handler as unknown as EventListener);
    return () =>
      window.removeEventListener(
        'keydown',
        handler as unknown as EventListener
      );
  }, [captureViewportAnchor, dispatch, pageNumber]);

  const requestGoToPage = useCallback(
    (page: number) => dispatch({ type: 'GO_TO_PAGE', page }),
    [dispatch]
  );

  return (
    <div
      ref={rootRef}
      className="pdf-root"
      tabIndex={-1}
      role="region"
      aria-label="Reader content"
    >
      <div className="pdf-body">
        <div
          className="pdf-viewport"
          ref={viewportWrapRef}
          style={{ overflowX: hasInitialWidthFit ? 'auto' : 'hidden' }}
        >
          {loading && (
            <div className="pdf-status-container">
              <div className="pdf-status">
                <LoadingSkeleton height="100%" state={null} />
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="pdf-status-container">
              <div className="pdf-status pdf-error">
                <Icon viewBox="0 0 24 24" w={7} h={7}>
                  <path
                    fill="currentColor"
                    d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                  />
                </Icon>
                <span>{error.message || 'Failed to load PDF'}</span>
              </div>
            </div>
          )}
          {!loading && !error && pdfDoc && pageBaseSizes.length > 0 && (
            <div
              className="pdf-pages-stack"
              style={{
                gap: PAGE_GAP,
                paddingTop: PAGE_GAP,
                paddingBottom: PAGE_GAP,
              }}
            >
              {pageBaseSizes.map((size, idx) => {
                const pageNumber = idx + 1;
                return (
                  <PdfPage
                    key={pageNumber}
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    scale={scale}
                    rotation={rotation}
                    baseSize={size}
                    isVisible={visiblePages.has(pageNumber)}
                    registerContainer={registerContainer}
                    goToPage={requestGoToPage}
                    onError={onErrorRef.current}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function useNewReader({
  fileUrl: fileUrlProp,
  file,
  data,
  webpubManifestUrl,
  manifest: inputManifest,
  proxyUrl,
  pdfWorkerSrc,
  height = DEFAULT_HEIGHT,
  initialPage = 1,
  initialScale = 1,
  initialFit = 'width',
  showToc = true,
  onDocumentLoad,
  onLoadComplete,
  onPageChange,
  onError,
  toggleFullScreen,
}: PdfReaderProps): Exclude<ReaderReturn, null> {
  // Resolve fileUrl from manifest when webpubManifestUrl + manifest are provided
  const fileUrl = useMemo(() => {
    if (fileUrlProp) return fileUrlProp;
    if (webpubManifestUrl && inputManifest) {
      return resolveResourceUrl(inputManifest, proxyUrl);
    }
    return undefined;
  }, [fileUrlProp, webpubManifestUrl, inputManifest, proxyUrl]);
  const [viewerState, dispatch] = useReducer(pdfReaderReducer, {
    pageNumber: initialPage,
    numPages: 0,
    scale: initialScale,
    fitMode: initialFit,
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

  useEffect(() => {
    setPdfLoadFailed(false);
    setPageSizesReady(false);
  }, [fileUrl, file, data]);

  const wrappedOnPageSizesReady = useCallback(() => {
    setPageSizesReady(true);
  }, []);

  const wrappedOnError = useCallback(
    (error: Error) => {
      setPdfLoadFailed(true);
      onError?.(error);
    },
    [onError]
  );

  useEffect(() => {
    dispatch({ type: 'GO_TO_PAGE', page: initialPage });
  }, [initialPage]);

  useEffect(() => {
    dispatch({ type: 'SET_SCALE', scale: initialScale });
  }, [initialScale]);

  useEffect(() => {
    dispatch({ type: 'SET_FIT', mode: initialFit });
  }, [initialFit]);

  const clearPendingAction = useCallback(() => setPendingAction(null), []);

  const state: ReaderState = useMemo(
    () => ({
      atStart: pageNumber <= 1,
      atEnd: pageNumber >= numPages,
      settings: DEFAULT_SETTINGS,
      fitMode: fitMode ?? 'width',
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

  const fileName = file instanceof File ? file.name : undefined;
  const manifestTitle = getManifestTitle('PDF Document', fileName);

  const manifest: WebpubManifest = useMemo(() => {
    if (inputManifest) {
      return {
        ...inputManifest,
        toc:
          showToc && outline.length > 0
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
      toc: showToc ? getManifestTocFromOutline(outline) : [],
    };
  }, [inputManifest, manifestTitle, outline, showToc]);

  const hasSource = !!(fileUrl || file || data);
  const isDocLoading = hasSource && !pageSizesReady && !pdfLoadFailed;

  const content = (
    <div style={{ position: 'relative', height }}>
      {isDocLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <LoadingSkeleton height="100%" state={null} />
        </div>
      )}
      <PdfReader
        fileUrl={fileUrl}
        file={file}
        data={data}
        pdfWorkerSrc={pdfWorkerSrc}
        onDocumentLoad={onDocumentLoad}
        onLoadComplete={onLoadComplete}
        onPageChange={onPageChange}
        onError={wrappedOnError}
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
}

export default function NewReader(props: PdfReaderProps): React.ReactElement {
  const reader = useNewReader(props);

  if (!props.fileUrl && !props.file && !props.data) {
    return <LoadingSkeleton height="100%" state={null} />;
  }

  return reader.content;
}
