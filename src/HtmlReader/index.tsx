import React from 'react';
import {
  DEFAULT_HEIGHT,
  DEFAULT_SHOULD_GROW_WHEN_SCROLLING,
  MAIN_CONTENT_ID,
} from '../constants';
import {
  ColorMode,
  FitMode,
  FontFamily,
  HtmlNavigator,
  ReaderReturn,
} from '../types';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import useUpdateLocalStorage from '../utils/localstorage';
import { navigateToHash, navigateToProgression } from './effects';
import {
  calcPosition,
  defaultInjectables,
  defaultInjectablesFixed,
  fetchAsTxt,
  isSameResource,
} from './lib';
import makeHtmlReducer, { inactiveState } from './reducer';
import { HtmlReaderArguments } from './types';
import useIframeLinkClick from './useIframeLinkClick';
import useLocationQuery from './useLocationQuery';
import useResource from './useResource';
import useUpdateCSS from './useUpdateCSS';
import { useUpdateScroll } from './useUpdateScroll';
import useWindowResize from './useWindowResize';

export default function useHtmlReader(args: HtmlReaderArguments): ReaderReturn {
  const {
    webpubManifestUrl,
    manifest,
    getContent = fetchAsTxt,
    injectablesReflowable = defaultInjectables,
    injectablesFixed = defaultInjectablesFixed,
    height = DEFAULT_HEIGHT,
    growWhenScrolling = DEFAULT_SHOULD_GROW_WHEN_SCROLLING,
    persistLastLocation = true,
    persistSettings = true,
    toggleFullScreen,
  } = args ?? {};

  const [state, dispatch] = React.useReducer(
    makeHtmlReducer(args),
    inactiveState
  );

  /**
   * Fetches the resource and keeps it in the reducer state.
   *
   * Load the fixed injectables if it's a fixed layout.
   */
  const currentResourceUrl = state.location?.href ?? null;
  const injectables =
    manifest?.metadata?.presentation?.layout === 'fixed'
      ? injectablesFixed
      : injectablesReflowable;

  useResource(manifest, state, getContent, injectables, dispatch);

  /**
   * Dispatches an action to update scroll position when the user *stops* scrolling.
   */
  useUpdateScroll(state, dispatch);

  /**
   * Store settings and current location in localStorage.
   * Use the metadata.identifier if it exists, otherwise use
   * the webpubManifestUrl as the key.
   */
  const identifier = manifest
    ? (manifest.metadata.identifier ?? webpubManifestUrl ?? null)
    : null;
  useUpdateLocalStorage(identifier, state, args);

  /**
   * Update url query param when location changes.
   */
  useLocationQuery(state);

  // dispatch action when window is resized
  useWindowResize(manifest, state, dispatch);

  // update iframe css variables when css state changes
  useUpdateCSS(state, manifest);

  // listen for internal link clicks
  useIframeLinkClick(webpubManifestUrl, manifest, dispatch);

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
        persistLastLocation,
        persistSettings,
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
    persistLastLocation,
    persistSettings,
  ]);

  /**
   * Navigate after location change
   * After loads, make sure we fire off effects to navigate the user if necessary.
   */
  React.useEffect(() => {
    // we do this on the next tick in case we are still calculating things.
    process.nextTick(() => {
      if (state.state === 'NAVIGATING') {
        const { fragment, progression, position } = state.location.locations;
        /**
         * We first try a fragment, then a progression, then a position value.
         */
        if (typeof fragment === 'string') {
          navigateToHash(fragment, state.iframe, state.settings.isScrolling);
        } else if (typeof progression === 'number') {
          navigateToProgression(
            state.iframe,
            progression,
            state.settings.isScrolling
          );
        } else if (typeof position === 'number') {
          // get the progression value for that page
          const { totalPages } = calcPosition(
            state.iframe,
            state.settings.isScrolling
          );
          const calculatedProgression = (position - 1) / totalPages;
          navigateToProgression(
            state.iframe,
            calculatedProgression,
            state.settings.isScrolling
          );
        }

        // tell the reducer that we have now completed the navigation.
        dispatch({ type: 'NAV_COMPLETE' });
      }
    });
  }, [
    state.state,
    state.iframe,
    state.settings?.isScrolling,
    state.location?.locations,
  ]);

  const navigator = React.useRef<HtmlNavigator>({
    goToPage(href) {
      dispatch({ type: 'GO_TO_HREF', href });
    },
    goToPageNumber(page) {
      dispatch({ type: 'GO_TO_PAGE', page });
    },
    async goForward() {
      dispatch({ type: 'GO_FORWARD' });
    },
    async goBackward() {
      dispatch({ type: 'GO_BACKWARD' });
    },
    async setColorMode(mode: ColorMode) {
      dispatch({ type: 'SET_COLOR_MODE', mode });
    },
    async setScroll(val) {
      const isScrolling = val === 'scrolling';
      dispatch({ type: 'SET_SCROLL', isScrolling });
    },
    async increaseFontSize() {
      dispatch({ type: 'INCREASE_FONT_SIZE' });
    },
    async decreaseFontSize() {
      dispatch({ type: 'DECREASE_FONT_SIZE' });
    },
    async resetSettings() {
      dispatch({ type: 'RESET_SETTINGS' });
    },
    async setFontFamily(family: FontFamily) {
      dispatch({ type: 'SET_FONT_FAMILY', family });
    },
    async setFitMode(mode: FitMode) {
      dispatch({ type: 'SET_FIT_MODE', fitMode: mode });
    },
  }).current;

  // doesn't belong in navigator as it's internal, but if this
  // is recreated every time, we end up in an infinite loop.
  const setIframe = React.useRef((el: HTMLIFrameElement) => {
    dispatch({ type: 'SET_IFRAME', iframe: el });
  }).current;

  // this format is inactive, return null
  if (!webpubManifestUrl || !manifest) return null;

  /**
   * Note: It is possible we are still in an "Inactive" state while there
   * are arguments to the hook, for exactly one render cycle. Thus if that's the
   * case, we also render the loading screen.
   */
  if (state.state === 'FETCHING_RESOURCE' || state.state === 'INACTIVE') {
    return {
      type: null,
      isLoading: true,
      content: <LoadingSkeleton height={height} state={state} />,
      navigator: null,
      manifest: null,
      state: null,
    };
  }

  if (state.state === 'RESOURCE_FETCH_ERROR') throw state.resourceFetchError;

  // determines if the reader should grow to fit content or stay the
  // pre-determined height passed in
  const shouldGrow = state.settings.isScrolling && growWhenScrolling;

  const englishTitle =
    typeof manifest.metadata.title === 'string'
      ? manifest.metadata.title
      : (manifest.metadata.title.en ?? 'Unknown Title');

  const resourceIndex = manifest.readingOrder.findIndex((link) =>
    isSameResource(link.href, state.location.href, webpubManifestUrl)
  );
  const numResources = manifest.readingOrder.length;

  const isFirstResource = resourceIndex === 0;
  const isLastResource = resourceIndex === numResources - 1;

  const isStartOfResource = state.location.locations.position === 1;
  const isEndOfResource = state.location.locations.remainingPositions === 0;

  const atStart = isFirstResource && isStartOfResource;
  const atEnd = isLastResource && isEndOfResource;

  const totalPages =
    state.iframe && state.settings
      ? calcPosition(state.iframe, state.settings.isScrolling).totalPages
      : 0;

  const currentPage = state.location?.locations?.position ?? 1;

  // the reader is active
  return {
    type: 'HTML',
    isLoading: false,
    content: (
      <>
        <iframe
          id={MAIN_CONTENT_ID}
          onLoad={() => dispatch({ type: 'IFRAME_LOADED' })}
          ref={setIframe}
          // as="iframe"
          style={{
            /**
             * This determines the height of the iframe.
             *
             * If we remove this, then in scrolling mode it simply grows to fit
             * content. In paginated mode, however, we must have this set because
             * we have to decide how big the content should be.
             */
            height: shouldGrow ? 'initial' : height,
            /**
             * We always want the height to be at least the defined height
             */
            minHeight: height,
            overflow: 'hidden',
          }}
          title={englishTitle}
          srcDoc={state.resource}
          src={currentResourceUrl ?? undefined}
        />
      </>
    ),
    state: {
      ...state,
      atStart,
      atEnd,
    },
    manifest,
    navigator,
    currentPage,
    totalPages,
    toggleFullScreen,
  };
}
