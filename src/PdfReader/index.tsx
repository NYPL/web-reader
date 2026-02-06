import { Flex } from '@chakra-ui/react';
import * as React from 'react';
import { Document, PageProps, pdfjs } from 'react-pdf';
import { FitMode, ReaderReturn } from '../types';
import ChakraPage from './ChakraPage';
import ScrollPage from './ScrollPage';
import useMeasure from './useMeasure';
// Required CSS in order for links to be clickable in PDFs
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  DEFAULT_HEIGHT,
  DEFAULT_SHOULD_GROW_WHEN_SCROLLING,
  MAIN_CONTENT_ID,
  READER_MARGIN,
} from '../constants';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { fetchAsUint8Array, getResourceUrl, SCALE_STEP } from './lib';
import './pdfReader.css';
import { makePdfReducer } from './reducer';
import { PdfReaderArguments } from './types';

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
  const [pageHeight, setPageHeight] = React.useState<number>(0);

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
      rotation: number
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
        height = Math.round(containerSize.height - READER_MARGIN);
        width = Math.round(height / aspectRatio);
      }
      if (width || height) {
        dispatch({ type: 'RESIZE_PAGE', width, height });
      }
    },
    [state.pdfWidth, state.pdfHeight]
  );

  React.useEffect(() => {
    resizePage(containerSize, state.fitMode, state.rotation ?? 0);
  }, [containerSize, resizePage, state.fitMode, state.rotation]);

  /**
   * Sets the initial page height for the PDF viewer based on the loaded PDF's aspect ratio
   * and the current container width. This effect runs only once when the PDF's dimensions
   * are first available and the page height has not yet been set.
   */
  React.useEffect(() => {
    if (pageHeight === 0 && state.pdfWidth && state.pdfHeight) {
      const aspectRatio = state.pdfHeight / state.pdfWidth;
      const initialPageHeight =
        (containerSize.width - READER_MARGIN) * aspectRatio;
      setPageHeight(Math.round(initialPageHeight));
    }
  }, [state.pdfWidth, state.pdfHeight, containerSize.width, pageHeight]);

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
    if (!state.settings?.isScrolling) return;
    // if the resource is not yet loaded, don't do anything yet
    if (!state.rendered) return;

    process.nextTick(() => {
      const page = document.querySelector(
        `[data-page-number="${state.pageNumber}"]`
      );
      page?.scrollIntoView();
    });
  }, [state.pageNumber, state.settings?.isScrolling, state.rendered]);

  const goForward = React.useCallback(async () => {
    dispatch({ type: 'GO_FORWARD' });
  }, []);

  const goBackward = React.useCallback(async () => {
    dispatch({ type: 'GO_BACKWARD' });
  }, []);

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

  const rotateLeft = React.useCallback(async () => {
    dispatch({ type: 'ROTATE_COUNTER_CLOCKWISE' });
  }, []);

  const goToPage = React.useCallback(async (href: string) => {
    dispatch({ type: 'GO_TO_HREF', href });
  }, []);

  const goToPageNumber = React.useCallback((page: number) => {
    dispatch({ type: 'GO_TO_PAGE', page: page });
  }, []);

  // const resetSettings = React.useCallback(async () => {
  //   dispatch({ type: 'RESET_SETTINGS' });
  // }, []);

  const setFitMode = React.useCallback((mode: FitMode) => {
    dispatch({ type: 'SET_FIT_MODE', fitMode: mode });
  }, []);

  const intersectionRatios = React.useRef<{ [page: number]: number }>({});
  const lastMostVisiblePage = React.useRef<number>(state.pageNumber);

  const onInView = React.useCallback(
    (pageNum: number, ratio: number) => {
      if (!state.settings?.isScrolling) return;
      intersectionRatios.current[pageNum] = ratio;

      Object.keys(intersectionRatios.current).forEach((key) => {
        if (intersectionRatios.current[Number(key)] === 0) {
          delete intersectionRatios.current[Number(key)];
        }
      });

      let maxRatio = -1;
      let mostVisiblePage = state.pageNumber;
      for (const [page, r] of Object.entries(intersectionRatios.current)) {
        if (r > maxRatio) {
          maxRatio = r;
          mostVisiblePage = Number(page);
        }
      }

      if (mostVisiblePage !== lastMostVisiblePage.current) {
        lastMostVisiblePage.current = mostVisiblePage;
        if (state.pageNumber !== mostVisiblePage) {
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
      Math.round(page.width) !== state.pdfWidth
    ) {
      dispatch({
        type: 'PAGE_LOAD_SUCCESS',
        height: Math.round(page.height),
        width: Math.round(page.width),
      });

      resizePage(containerSize, state.fitMode, state.rotation ?? 0);
    }
  }

  // the reader is active but loading a page
  return {
    type: 'PDF',
    isLoading: false,
    content: (
      <Flex
        as="main"
        zIndex="base"
        flex="1 0 auto"
        justifyContent="center"
        alignItems="center"
        tabIndex={-1}
        id={MAIN_CONTENT_ID}
        ref={containerRef}
        height={pageHeight}
        sx={{
          '.react-pdf__Document': {
            height: `${pageHeight}px`,
            overflowX: 'hidden',
            overflowY: 'auto',
          },
          '.react-pdf__Page': {
            width: `${
              containerSize.width ? containerSize.width - READER_MARGIN : 0
            }px`,
          },
        }}
      >
        <Document
          file={state.resource}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
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
                    allowInView={!isFetching}
                    onInView={onInView}
                    fitMode={state.fitMode}
                    rotate={state.rotation ?? 0}
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
      rotateLeft,
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
