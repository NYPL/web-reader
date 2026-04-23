import { Flex } from '@chakra-ui/react';
import * as React from 'react';
import { Document, PageProps, pdfjs } from 'react-pdf';
import {
  DEFAULT_HEIGHT,
  DEFAULT_SHOULD_GROW_WHEN_SCROLLING,
  IN_VIEW_DELAY_MS,
  MAIN_CONTENT_ID,
  READER_MARGIN,
} from '../constants';
import { FitMode, ReaderReturn } from '../types';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ChakraPage from './ChakraPage';
import { fetchAsUint8Array, getResourceUrl, SCALE_STEP } from './lib';
import './pdfReader.css';
import { makePdfReducer } from './reducer';
import ScrollPage from './ScrollPage';
import { PdfReaderArguments } from './types';
import useMeasure from './useMeasure';

/**
 * The PDF reader
 *
 * The PDF reader loads resources in two stages:  First, it fetches the PDF resource as an Uint8Array
 * Then, it passes this array into the <Document> object, which loads the PDF inside an iframe
 *
 * @param args T
 * @returns
 */
export default function usePdfReader(args: PdfReaderArguments): ReaderReturn {
  // use a passed in src for the pdf worker
  if (args?.pdfWorkerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = args.pdfWorkerSrc;
  }

  const {
    webpubManifestUrl,
    manifest,
    proxyUrl,
    getContent = fetchAsUint8Array,
    injectablesReflowable,
    injectablesFixed,
    height = DEFAULT_HEIGHT,
    growWhenScrolling = DEFAULT_SHOULD_GROW_WHEN_SCROLLING,
    toggleFullScreen,
  } = args ?? {};

  const [state, dispatch] = React.useReducer(makePdfReducer(args), {
    state: 'INACTIVE',
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
    settings: undefined,
    rendered: false,
    fitMode: 'width',
  });

  // state we can derive from the state above
  const isFetching = !state.resource;
  const isParsed = typeof state.numPages === 'number';
  const [containerRef, containerSize] = useMeasure<HTMLDivElement>();

  const documentContainerRef = React.useRef<HTMLDivElement | null>(null);
  const pageRefs = React.useRef<Map<number, HTMLElement>>(new Map());
  const setPageRef = React.useCallback(
    (pageNumber: number, element: HTMLElement | null) => {
      if (element) {
        pageRefs.current.set(pageNumber, element);
        return;
      }
      pageRefs.current.delete(pageNumber);
    },
    []
  );

  const scrollState = React.useRef({
    ratios: new Map<number, number>(),
    lastVisiblePage: state.pageNumber,
    isInViewUpdate: false,
    lastProgrammaticNavAt: 0,
  });

  // dispatch action when arguments change
  React.useEffect(() => {
    if (!webpubManifestUrl || !manifest) {
      return dispatch({ type: 'ARGS_CHANGED', args: undefined });
    }
    dispatch({
      type: 'ARGS_CHANGED',
      args: {
        webpubManifestUrl,
        manifest,
        getContent,
        injectablesReflowable,
        injectablesFixed,
        height,
        growWhenScrolling,
      },
    });
  }, [
    webpubManifestUrl,
    manifest,
    getContent,
    injectablesReflowable,
    injectablesFixed,
    height,
    growWhenScrolling,
  ]);

  /**
   * Load the current resource and set it in state,
   * and reload whenever it changes (via navigation)
   */
  React.useEffect(() => {
    // bail out if there is not manifest passed in,
    // that indicates that this format is inactive
    if (!manifest) return;
    // throw an error on a badly formed manifest
    if (!manifest.readingOrder || !manifest.readingOrder.length) {
      throw new Error('Manifest has no Reading Order');
    }

    const currentResource = getResourceUrl(
      state.resourceIndex,
      manifest.readingOrder
    );

    const fetchResource = async () => {
      getContent(currentResource, proxyUrl).then((data) => {
        dispatch({
          type: 'RESOURCE_FETCH_SUCCESS',
          resource: { data },
        });
      });
    };
    if (manifest.readingOrder && manifest.readingOrder.length) {
      fetchResource();
    }
  }, [state.resourceIndex, manifest, proxyUrl, getContent]);

  /**
   * calculate the height or width of the pdf page to fit to dimensions.
   *  - if the page's aspect ratio is taller than the container's, we will constrain
   *    the page to the height of the container.
   *  - if the page's aspect ratio is wider than the container's, we will constrain
   *    the page to the width of the container
   */
  const resizePage = React.useCallback(
    (
      containerSize: { width: number; height: number },
      fitMode: FitMode,
      rotation: number,
      scale: number
    ) => {
      if (!fitMode) return;

      let width, height, aspectRatio;
      const isRotated = rotation % 180 !== 0;
      const pdfWidth = isRotated ? state.pdfHeight : state.pdfWidth;
      const pdfHeight = isRotated ? state.pdfWidth : state.pdfHeight;

      if (fitMode === 'width' && containerSize.width) {
        width = Math.round(containerSize.width - READER_MARGIN);
        aspectRatio = pdfHeight / pdfWidth;
        height = Math.round(width * aspectRatio);
      } else if (
        fitMode === 'height' &&
        pdfWidth &&
        pdfHeight &&
        containerSize.height
      ) {
        aspectRatio = pdfHeight / pdfWidth;
        height = Math.round((containerSize.height - READER_MARGIN) * scale);
        width = Math.round((height / aspectRatio) * scale);
      }
      if (width || height) {
        dispatch({ type: 'RESIZE_PAGE', width, height });
      }
    },
    [state.pdfWidth, state.pdfHeight]
  );

  React.useEffect(() => {
    resizePage(containerSize, state.fitMode, state.rotation ?? 0, state.scale);
  }, [containerSize, resizePage, state.fitMode, state.rotation, state.scale]);

  /**
   * Update the atStart/atEnd state to tell the UI whether to show the prev/next buttons
   * Whether to have the next/prev buttons enabled. We disable them:
   *   - When on the first or last page of the first or last resource
   */
  React.useEffect(() => {
    const isFirstResource = state.resourceIndex === 0;
    const isFirstResourceStart = isFirstResource && state.pageNumber === 1;
    const showPrevButton = !isFirstResourceStart;

    const isLastResource =
      state.resourceIndex === (manifest?.readingOrder?.length ?? 1) - 1;
    const isLastResourceEnd =
      isLastResource && state.pageNumber === state.numPages;
    const showNextButton = !isLastResourceEnd;

    dispatch({
      type: 'BOOK_BOUNDARY_CHANGED',
      atStart: !showPrevButton,
      atEnd: !showNextButton,
    });
  }, [
    manifest?.readingOrder?.length,
    state.pageNumber,
    state.resourceIndex,
    state.settings?.isScrolling,
    state.numPages,
  ]);

  /**
   * In scrolling mode, manually scroll the user when the page changes
   */
  React.useEffect(() => {
    // if the resource is not yet loaded, don't do anything yet
    if (!state.settings?.isScrolling || !state.rendered) return;

    // If the change came from a scroll event, don't trigger a manual scroll back
    if (scrollState.current.isInViewUpdate) {
      scrollState.current.isInViewUpdate = false;
      return;
    }

    const documentContainer = documentContainerRef.current;
    const pageRef = pageRefs.current.get(state.pageNumber);

    if (documentContainer && pageRef) {
      const containerRect = documentContainer.getBoundingClientRect();
      const pageRect = pageRef.getBoundingClientRect();

      documentContainer.scrollTo({
        top: documentContainer.scrollTop + (pageRect.top - containerRect.top),
      });
    }
  }, [state.pageNumber, state.settings?.isScrolling, state.rendered]);

  const beginProgrammaticNavigation = React.useCallback(
    (pendingPage: number) => {
      const currentScrollState = scrollState.current;
      currentScrollState.lastVisiblePage = pendingPage;
      currentScrollState.lastProgrammaticNavAt = Date.now();
      currentScrollState.ratios.clear();
    },
    []
  );

  const goForward = React.useCallback(async () => {
    beginProgrammaticNavigation(
      state.numPages
        ? Math.min(state.pageNumber + 1, state.numPages)
        : state.pageNumber + 1
    );
    dispatch({ type: 'GO_FORWARD' });
  }, [beginProgrammaticNavigation, state.numPages, state.pageNumber]);

  const goBackward = React.useCallback(async () => {
    beginProgrammaticNavigation(Math.max(1, state.pageNumber - 1));
    dispatch({ type: 'GO_BACKWARD' });
  }, [beginProgrammaticNavigation, state.pageNumber]);

  const setScroll = React.useCallback(
    async (val: 'scrolling' | 'paginated') => {
      const isScrolling = val === 'scrolling';
      dispatch({ type: 'SET_SCROLL', isScrolling });
    },
    []
  );

  const zoomIn = React.useCallback(async () => {
    dispatch({
      type: 'SET_SCALE',
      scale: state.scale + SCALE_STEP,
    });
  }, [state.scale]);

  const zoomOut = React.useCallback(async () => {
    dispatch({
      type: 'SET_SCALE',
      scale: state.scale - SCALE_STEP,
    });
  }, [state.scale]);

  const rotateCounterClockwise = React.useCallback(async () => {
    dispatch({ type: 'ROTATE_COUNTER_CLOCKWISE' });
  }, []);

  const goToPage = React.useCallback(async (href: string) => {
    dispatch({ type: 'GO_TO_HREF', href });
  }, []);

  const goToPageNumber = React.useCallback(
    (page: number) => {
      beginProgrammaticNavigation(page);
      dispatch({ type: 'GO_TO_PAGE', page: page });
    },
    [beginProgrammaticNavigation]
  );

  // const resetSettings = React.useCallback(async () => {
  //   dispatch({ type: 'RESET_SETTINGS' });
  // }, []);

  const setFitMode = React.useCallback((mode: FitMode) => {
    dispatch({ type: 'SET_FIT_MODE', fitMode: mode });
  }, []);

  const onInView = React.useCallback(
    (pageNum: number, ratio: number) => {
      const currentScrollState = scrollState.current;

      if (
        !state.settings?.isScrolling ||
        Date.now() - currentScrollState.lastProgrammaticNavAt < IN_VIEW_DELAY_MS
      )
        return;

      if (ratio <= 0) {
        currentScrollState.ratios.delete(pageNum);
        return;
      }

      currentScrollState.ratios.set(pageNum, ratio);

      let mostVisiblePage = currentScrollState.lastVisiblePage;
      let maxRatio = -1;

      for (const [p, r] of currentScrollState.ratios) {
        if (r > maxRatio) {
          maxRatio = r;
          mostVisiblePage = p;
        }
        if (r > 0.8) break;
      }

      if (mostVisiblePage !== currentScrollState.lastVisiblePage) {
        currentScrollState.lastVisiblePage = mostVisiblePage;
        if (state.pageNumber !== mostVisiblePage) {
          currentScrollState.isInViewUpdate = true;
          dispatch({ type: 'PAGE_IN_VIEW', page: mostVisiblePage });
        }
      }
    },
    [state.settings?.isScrolling, state.pageNumber]
  );

  // this format is inactive, return null
  if (!webpubManifestUrl || !manifest) return null;

  if (state.state === 'INACTIVE' || isFetching) {
    return {
      type: null,
      isLoading: true,
      content: <LoadingSkeleton height={height} state={state} />,
      navigator: null,
      manifest: null,
      state: null,
    };
  }

  if (state.state === 'ERROR') throw state.error;

  // if (isFetching) {
  //   // The Reader is fetching a PDF resource
  //   return {
  //     type: 'PDF',
  //     isLoading: false,
  //     content: (
  //       <Flex
  //         as="main"
  //         tabIndex={-1}
  //         id="iframe-wrapper"
  //         zIndex="base"
  //         alignItems="center"
  //         justifyContent="center"
  //         flex="1 0 auto"
  //         height={height}
  //       >
  //         PDF is loading
  //       </Flex>
  //     ),
  //     state,
  //     manifest,
  //     navigator: {
  //       goForward,
  //       goBackward,
  //       zoomIn,
  //       zoomOut,
  //       setScroll,
  //       goToPage,
  //     },
  //   };
  // }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    dispatch({
      type: 'PDF_PARSED',
      numPages: numPages,
    });
  };

  const onDocumentLoadError = (error: Error) => {
    dispatch({
      type: 'PDF_LOAD_ERROR',
      error: error,
    });
  };

  function onRenderSuccess(page: PageProps) {
    if (!page.height || !page.width)
      throw new Error(
        'Error rendering page from Reader, please refresh your page.'
      );
    if (
      Math.round(page.height) !== state.pdfHeight ||
      Math.round(page.width) > state.pdfWidth
    ) {
      dispatch({
        type: 'PAGE_LOAD_SUCCESS',
        height: Math.round(page.height),
        width: Math.round(page.width),
      });

      resizePage(
        containerSize,
        state.fitMode,
        state.rotation ?? 0,
        state.scale
      );
    }
  }

  // the reader is active but loading a page
  return {
    type: 'PDF',
    isLoading: false,
    content: (
      <Flex
        role="region"
        aria-label="Reader content"
        zIndex="base"
        flex="1 0 auto"
        justifyContent="center"
        alignItems="center"
        tabIndex={-1}
        id={MAIN_CONTENT_ID}
        ref={containerRef}
        height={height}
        sx={{
          '.react-pdf__Document': {
            width: '100%',
            height: '100%',
            overflowX: 'auto',
            overflowY: 'auto',
          },
          '.react-pdf__Page': {
            width: `${
              containerSize.width ? containerSize.width - READER_MARGIN : 0
            }px`,
            height: (state.pageHeight ?? 1) * state.scale,
          },
        }}
      >
        <Document
          file={state.resource}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          inputRef={documentContainerRef}
        >
          {isParsed && state.numPages && (
            <>
              {state.settings.isScrolling &&
                Array.from(new Array(state.numPages), (_, index) => (
                  <ScrollPage
                    key={`page_${index + 1}`}
                    width={state.pageWidth}
                    height={state.pageHeight}
                    placeholderHeight={state.pdfHeight}
                    placeholderWidth={state.pdfWidth}
                    scale={state.scale}
                    pageNumber={index + 1}
                    onLoadSuccess={onRenderSuccess}
                    allowInView={state.rendered}
                    onInView={onInView}
                    fitMode={state.fitMode}
                    rotate={state.rotation ?? 0}
                    onPageRef={setPageRef}
                  />
                ))}
              {!state.settings.isScrolling && (
                <ChakraPage
                  pageNumber={state.pageNumber}
                  onLoadSuccess={onRenderSuccess}
                  width={state.pageWidth}
                  height={state.pageHeight}
                  scale={state.scale}
                  loading={<></>}
                  fitMode={state.fitMode}
                />
              )}
            </>
          )}
        </Document>
      </Flex>
    ),
    state,
    manifest,
    navigator: {
      goForward,
      goBackward,
      setScroll,
      zoomIn,
      zoomOut,
      rotateCounterClockwise,
      goToPage,
      goToPageNumber,
      // resetSettings,
      setFitMode,
    },
    currentPage: state.pageNumber,
    totalPages: state.numPages ?? 0,
    toggleFullScreen,
  };
}
