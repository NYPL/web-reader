import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { MAIN_CONTENT_ID } from '../constants';
import ReaderErrorAlert from '../ui/ReaderErrorAlert';
import PdfPage from './PdfPage';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_GAP,
  PAGE_MEASURE_BUFFER,
  PAGE_PADDING,
  RENDER_ROOT_MARGIN,
  SCROLLSPY_ANCHOR_RATIO,
} from './constants';
import {
  FitMode,
  PageSize,
  PdfOutlineEntry,
  PdfReaderContentProps,
  ViewportAnchor,
} from './types';
import {
  getDisplayPageHeight,
  getPageTop,
  getRotatedSize,
  resolveOutline,
  toError,
} from './utils';

const PdfReaderContent = ({
  fileUrl,
  pdfWorkerSrc,
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
  loadOutline,
  onError,
}: PdfReaderContentProps): React.ReactElement => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (pdfWorkerSrc) GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
  }, [pdfWorkerSrc]);

  const [pageBaseSizes, setPageBaseSizes] = useState<PageSize[]>([]);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pageRenderErrors, setPageRenderErrors] = useState<Map<number, Error>>(
    new Map()
  );
  const [rangeCapable, setRangeCapable] = useState<boolean>(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportWrapRef = useRef<HTMLDivElement | null>(null);
  const containerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const renderObserverRef = useRef<IntersectionObserver | null>(null);
  const currentPageRef = useRef(pageNumber);
  const pendingScrollTargetRef = useRef<number | null>(null);
  const lastHandledNavigationRequestRef = useRef(0);
  const pendingViewportAnchorRef = useRef<ViewportAnchor | null>(null);
  const suppressNextResizeFitRef = useRef(false);
  const onPageSizesReadyRef = useRef(onPageSizesReady);
  const measuredPagesRef = useRef<Set<number>>(new Set());
  const initialBatchAppliedRef = useRef(false);
  const userZoomedRef = useRef(false);
  const pageBaseSizesRef = useRef<PageSize[]>([]);

  useEffect(() => {
    pageBaseSizesRef.current = pageBaseSizes;
  }, [pageBaseSizes]);

  useEffect(() => {
    onPageSizesReadyRef.current = onPageSizesReady;
  }, [onPageSizesReady]);

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  useEffect(() => {
    currentPageRef.current = pageNumber;
  }, [pageNumber]);

  const handlePageRenderError = useCallback(
    (failedPageNumber: number, nextError: Error) => {
      setPageRenderErrors((prev) => {
        const existingError = prev.get(failedPageNumber);
        if (existingError?.message === nextError.message) return prev;
        const next = new Map(prev);
        next.set(failedPageNumber, nextError);
        return next;
      });
    },
    []
  );

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
    setPageRenderErrors(new Map());
    containerRefs.current.clear();
    setRangeCapable(false);

    fetch(fileUrl, { headers: { Range: 'bytes=0-1' } })
      .then((res) => {
        if (cancelled) return;
        setRangeCapable(
          res.status === 206 && res.headers.get('Accept-Ranges') === 'bytes'
        );
      })
      .catch(() => {
        if (!cancelled) setRangeCapable(false);
      });

    const loadDocument = async () => {
      try {
        loadingTask = getDocument({
          url: fileUrl,
          withCredentials: false,
          disableStream: true, // Disable streaming to reduce memory pressure
          disableAutoFetch: true, // Disable background prefetch of non-visible pages
          rangeChunkSize: 1024 * 1024, // 1MB
        });
        const doc = await loadingTask.promise;
        if (cancelled) return;

        setPdfDoc(doc);
        dispatch({ type: 'PAGES_LOADED', numPages: doc.numPages });
        measuredPagesRef.current = new Set();
        initialBatchAppliedRef.current = false;
        userZoomedRef.current = false;
        setPageBaseSizes(
          Array.from({ length: doc.numPages }, () => DEFAULT_PAGE_SIZE)
        );
        onPageSizesReadyRef.current?.();
      } catch (err: unknown) {
        if (cancelled) return;
        const nextError = toError(err, 'Failed to load PDF document');
        setError(nextError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
      loadingTask?.destroy?.();
    };
  }, [fileUrl, dispatch, onOutlineLoad]);

  useEffect(() => {
    if (!pdfDoc || !loadOutline) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const rawOutline = (await pdfDoc.getOutline()) as
          | PdfOutlineEntry[]
          | null;
        if (rawOutline && !cancelled) {
          onOutlineLoad(await resolveOutline(pdfDoc, rawOutline));
        }
      } catch {
        // Outline is optional, ignore failures.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, onOutlineLoad, loadOutline]);

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
    wrap.scrollTop = target.offsetTop;
    lastHandledNavigationRequestRef.current = navigationRequestId;
  }, [navigationRequestId, pageBaseSizes.length, pageNumber]);

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

  // Measure the size of the current/visible pages with a buffer, lazily
  // fetching new pages in view. Only used for linearized PDFs.
  useEffect(() => {
    if (!pdfDoc || !pageBaseSizes.length || !rangeCapable) {
      return undefined;
    }
    let cancelled = false;

    const wanted = new Set<number>();
    const addRange = (center: number) => {
      const start = Math.max(1, center - PAGE_MEASURE_BUFFER);
      const end = Math.min(pdfDoc.numPages, center + PAGE_MEASURE_BUFFER);
      for (let p = start; p <= end; p += 1) wanted.add(p);
    };
    addRange(pageNumber);
    visiblePages.forEach(addRange);

    const toMeasure = Array.from(wanted).filter(
      (p) => !measuredPagesRef.current.has(p)
    );
    if (!toMeasure.length) return undefined;

    (async () => {
      const updates: { index: number; size: PageSize }[] = [];
      for (const p of toMeasure) {
        if (cancelled) return;
        try {
          const page = await pdfDoc.getPage(p);
          if (cancelled) return;
          const vp = page.getViewport({ scale: 1, rotation: 0 });
          updates.push({
            index: p - 1,
            size: { width: vp.width, height: vp.height },
          });
          page.cleanup();
          measuredPagesRef.current.add(p);
        } catch (err: unknown) {
          if (cancelled) return;
          setError(toError(err, 'Failed to read page dimensions'));
          return;
        }
      }
      if (cancelled || !updates.length) return;
      captureViewportAnchor();

      const next = pageBaseSizesRef.current.slice();
      updates.forEach(({ index, size }) => {
        next[index] = size;
      });

      let correctedScale: number | null = null;
      if (!initialBatchAppliedRef.current) {
        initialBatchAppliedRef.current = true;
        const sample = updates[0].size;
        for (let i = 0; i < next.length; i += 1) {
          if (!measuredPagesRef.current.has(i + 1)) next[i] = sample;
        }

        if (fitMode) {
          const wrap = viewportWrapRef.current;
          if (wrap) {
            const refIndex =
              Math.min(Math.max(currentPageRef.current, 1), next.length) - 1;
            const rotated = getRotatedSize(next[refIndex], rotation);
            const widestRotatedPageWidth = next.reduce((maxWidth, page) => {
              return Math.max(maxWidth, getRotatedSize(page, rotation).width);
            }, 0);
            const availWidth = wrap.clientWidth - PAGE_PADDING;
            const availHeight = wrap.clientHeight - PAGE_PADDING;
            const newScale =
              fitMode === 'width'
                ? availWidth / widestRotatedPageWidth
                : availHeight / rotated.height;
            if (newScale > 0) correctedScale = newScale;
          }
        }
      }

      setPageBaseSizes(next);
      if (correctedScale != null && !userZoomedRef.current) {
        suppressNextResizeFitRef.current = true;
        dispatch({ type: 'SET_SCALE', scale: correctedScale });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pdfDoc,
    pageNumber,
    visiblePages,
    pageBaseSizes.length,
    captureViewportAnchor,
    rangeCapable,
  ]);

  // Measure every page's size up front. Only used for non-linearized PDFs.
  useEffect(() => {
    if (!pdfDoc || rangeCapable) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const sizes: PageSize[] = [];
        for (let i = 1; i <= pdfDoc.numPages; i += 1) {
          if (cancelled) return;
          const page = await pdfDoc.getPage(i);
          const vp = page.getViewport({ scale: 1, rotation: 0 });
          sizes.push({ width: vp.width, height: vp.height });
          page.cleanup();
          measuredPagesRef.current.add(i);
        }
        if (cancelled) return;

        let correctedScale: number | null = null;
        if (fitMode) {
          const wrap = viewportWrapRef.current;
          if (wrap) {
            const refIndex =
              Math.min(Math.max(currentPageRef.current, 1), sizes.length) - 1;
            const rotated = getRotatedSize(sizes[refIndex], rotation);
            const widestRotatedPageWidth = sizes.reduce((maxWidth, page) => {
              return Math.max(maxWidth, getRotatedSize(page, rotation).width);
            }, 0);
            const availWidth = wrap.clientWidth - PAGE_PADDING;
            const availHeight = wrap.clientHeight - PAGE_PADDING;
            const newScale =
              fitMode === 'width'
                ? availWidth / widestRotatedPageWidth
                : availHeight / rotated.height;
            if (newScale > 0) correctedScale = newScale;
          }
        }

        setPageBaseSizes(sizes);
        if (correctedScale != null && !userZoomedRef.current) {
          suppressNextResizeFitRef.current = true;
          dispatch({ type: 'SET_SCALE', scale: correctedScale });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setError(toError(err, 'Failed to read page dimensions'));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, rangeCapable]);

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

  useEffect(() => {
    if (fitMode) applyFitScale(fitMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitMode, pageBaseSizes.length]);

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
      userZoomedRef.current = true;
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

  // Re-apply fit scale on container resize.
  const fitModeRef = useRef(fitMode);
  useEffect(() => {
    fitModeRef.current = fitMode;
  }, [fitMode]);

  const applyFitScaleRef = useRef(applyFitScale);
  useEffect(() => {
    applyFitScaleRef.current = applyFitScale;
  }, [applyFitScale]);

  useEffect(() => {
    const wrap = viewportWrapRef.current;
    if (!wrap) return undefined;
    const ro = new ResizeObserver(() => {
      if (suppressNextResizeFitRef.current) {
        suppressNextResizeFitRef.current = false;
        return;
      }
      if (fitModeRef.current) applyFitScaleRef.current(fitModeRef.current);
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

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
      id={MAIN_CONTENT_ID}
    >
      <div className="pdf-body">
        <div className="pdf-viewport" ref={viewportWrapRef}>
          {loading && (
            <div className="pdf-status-container">
              <div className="pdf-status">Loading</div>
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
                const pageError = pageRenderErrors.get(pageNumber);
                if (pageError) {
                  const rotatedSize = getRotatedSize(size, rotation);
                  const pageWidth = rotatedSize.width * scale;
                  const pageHeight = rotatedSize.height * scale;

                  return (
                    <div
                      key={pageNumber}
                      className="pdf-page-wrap"
                      data-page-number={pageNumber}
                      ref={(el) => registerContainer(pageNumber, el)}
                      style={{
                        width: pageWidth,
                        height: pageHeight,
                        overflow: 'hidden',
                      }}
                    >
                      <div className="pdf-page-error">
                        <ReaderErrorAlert
                          title="Rendering error"
                          message={pageError.message}
                          maxW="90%"
                        />
                      </div>
                    </div>
                  );
                }

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
                    onError={handlePageRenderError}
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

export default PdfReaderContent;
