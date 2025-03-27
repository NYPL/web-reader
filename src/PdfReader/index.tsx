import { Document, PageProps, pdfjs } from 'react-pdf';
import * as React from 'react';
import { ReaderReturn } from '../types';
import { Flex } from '@chakra-ui/react';
import useMeasure from './useMeasure';
import ChakraPage from './ChakraPage';
import ScrollPage from './ScrollPage';
// Required CSS in order for links to be clickable in PDFs
import './pdf.css';
import { HEADER_HEIGHT, FOOTER_HEIGHT, MAIN_CONTENT_ID } from '../constants';
import {
  DEFAULT_HEIGHT,
  DEFAULT_SHOULD_GROW_WHEN_SCROLLING,
} from '../constants';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { fetchAsUint8Array, getResourceUrl, SCALE_STEP } from './lib';
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
  });

  // state we can derive from the state above
  const isFetching = !state.resource;
  const isParsed = typeof state.numPages === 'number';
  const [containerRef, containerSize] = useMeasure<HTMLDivElement>();

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

    // NOTE: DELETE ME
    dispatch({
      type: 'RESOURCE_FETCH_SUCCESS',
      resource: { data: undefined },
    });
    // const fetchResource = async () => {
    //   getContent(currentResource, proxyUrl).then((data) => {
    //     dispatch({
    //       type: 'RESOURCE_FETCH_SUCCESS',
    //       resource: { data },
    //     });
    //   });
    // };
    // if (manifest.readingOrder && manifest.readingOrder.length) {
    //   fetchResource();
    // }
  }, [state.resourceIndex, manifest, proxyUrl, getContent]);

  /**
   * calculate the height or width of the pdf page in paginated mode.
   *  - if the page's aspect ratio is taller than the container's, we will constrain
   *    the page to the height of the container.
   *  - if the page's aspect ratio is wider than the container's, we will constrain
   *    the page to the width of the container
   */
  const resizePage = React.useCallback(
    (
      pdfWidth: number,
      pdfHeight: number,
      containerSize: { width: number; height: number }
    ) => {
      const wRatio = pdfWidth / containerSize.width;
      const hRatio = pdfHeight / containerSize.height;

      const fitHorizontal = wRatio > hRatio;
      const width = fitHorizontal ? Math.round(containerSize.width) : undefined;
      const height = !fitHorizontal
        ? Math.round(containerSize.height)
        : undefined;

      dispatch({ type: 'RESIZE_PAGE', width, height });
    },
    []
  );

  React.useEffect(() => {
    resizePage(state.pdfWidth, state.pdfHeight, containerSize);
  }, [containerSize, state.pdfWidth, state.pdfHeight, resizePage]);

  /**
   * Update the atStart/atEnd state to tell the UI whether to show the prev/next buttons
   * Whether to have the next/prev buttons enabled. We disable them:
   *   - In scroll mode when on the first or last resource
   *   - In paginated mode when on the first or last page of the first or last resource
   */
  React.useEffect(() => {
    const isScrolling = state.settings?.isScrolling;
    const isFirstResource = state.resourceIndex === 0;
    const isFirstResourceStart = isFirstResource && state.pageNumber === 1;
    const showPrevButton = isScrolling
      ? !isFirstResource
      : !isFirstResourceStart;

    const isLastResource =
      state.resourceIndex === (manifest?.readingOrder?.length ?? 1) - 1;
    const isLastResourceEnd =
      isLastResource && state.pageNumber === state.numPages;
    const showNextButton = isScrolling ? !isLastResource : !isLastResourceEnd;

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

  const goToPage = React.useCallback(async (href: string) => {
    dispatch({ type: 'GO_TO_HREF', href });
  }, []);

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
    console.log('OnLoad', numPages);
    dispatch({
      type: 'PDF_PARSED',
      numPages: numPages,
    });
  };

  const onDocumentLoadError = (error: Error) => {
    console.log('Error', error);
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

      resizePage(page.width, page.height, containerSize);
    }
  }

  const shouldGrow = state.settings?.isScrolling && growWhenScrolling;
  const finalHeight = shouldGrow ? 'initial' : height;

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
        height={finalHeight}
      >
        {/* FIXME: POC, update this with more a react proach. chakra.factory throws memory leak error.*/}
        <style>
          {`
            .react-pdf__Document {
              height: calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px);
              overflow-x: hidden;
              overflow-y: auto;
            }
          `}
        </style>
        <Document
          // NOTE: Edit this to fetch to a different endpoint/url
          file={'http://127.0.0.1:8000/video'}
          // file={state.resource}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          // options={
          //   {
          //     disableAutoFetch: true,
          //     disableStream: true,
          //     rangeChunkSize: 65536,
          //   }
          // }
        >
          {isParsed && state.numPages && (
            <>
              {state.settings.isScrolling &&
                Array.from(new Array(state.numPages), (_, index) => (
                  <ScrollPage
                    key={`page_${index + 1}`}
                    // width is necessary to pass to react-pdf Page component on initial render
                    width={containerSize.width}
                    placeholderHeight={state.pdfHeight}
                    placeholderWidth={state.pdfWidth}
                    scale={state.scale}
                    pageNumber={index + 1}
                    onLoadSuccess={onRenderSuccess}
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
      goToPage,
    },
  };
}
