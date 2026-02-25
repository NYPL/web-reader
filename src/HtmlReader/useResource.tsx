import React from 'react';
import { Injectable } from '../Readium/Injectable';
import { WebpubManifest } from '../types';
import { setCss } from './effects';
import { makeInjectableElement } from './lib';
import { HtmlState, HtmlAction } from './types';

/**
 * Fetches a resource whenever the url changes and dispatches
 * actions to keep the reducer up to date. Works similar to
 * useSWR, but storing the resource in the reducer state, not
 * separately.
 *
 * Also performs some modifications on the resource to add initial
 * css variables and injectables.
 */
export default function useResource(
  manifest: WebpubManifest | undefined,
  state: HtmlState,
  getContent: (url: string) => Promise<string>,
  injectables: Injectable[],
  dispatch: React.Dispatch<HtmlAction>
): void {
  const currentResourceUrl = state.location?.href ?? null;

  React.useEffect(() => {
    if (!currentResourceUrl) {
      return;
    }

    async function fetchResource(url: string) {
      // if there are no settings, the reader is inactive
      if (!state.settings) return;
      try {
        const content = await getContent(url);
        const mimetype =
          (state.location?.type ?? url.endsWith('.html'))
            ? 'text/html'
            : 'application/xhtml+xml';
        const document = new DOMParser().parseFromString(content, mimetype);

        // add base so relative URLs work.
        const base = document?.createElement('base');
        if (base && url) {
          base.setAttribute('href', url);
          document?.head.appendChild(base);
        }

        for (const injectable of injectables) {
          const element = makeInjectableElement(document, injectable);
          if (element) document?.head.appendChild(element);
        }

        injectJS(document.body);

        // While fetching, the page renders a progressbar with skeleton
        const iframeContainer: HTMLElement | null =
          window.document.querySelector('main [role="progressbar"]');

        const readerSettings = {
          colorMode: state.settings.colorMode,
          fontSize: state.settings.fontSize,
          fontFamily: state.settings.fontFamily,
          isScrolling: state.settings.isScrolling,
        };
        // set the initial CSS state
        setCss(document, readerSettings, iframeContainer, manifest);

        const finalResource = new XMLSerializer().serializeToString(document);
        dispatch({ type: 'RESOURCE_FETCH_SUCCESS', resource: finalResource });
      } catch (e) {
        if (e instanceof Error) {
          dispatch({ type: 'RESOURCE_FETCH_ERROR', error: e });
        } else {
          const message =
            typeof e === 'string'
              ? `Resource Fetch Error: ${e}`
              : 'Unknown Resource Fetch Error';
          dispatch({ type: 'RESOURCE_FETCH_ERROR', error: new Error(message) });
        }
      }
    }

    fetchResource(currentResourceUrl);

    // we specifically do _not_ want to re-run this on state changes
    // because that would rerun it every time a user changes settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResourceUrl, getContent, dispatch, injectables]);
}

/**
 * Injects a script tag which intercepts link clicks and sends a message
 * to the parent iframe.
 *
 * Note: When injecting script text content into XHTML documents, we get
 * an error due to the XHTML escaping the '<' sign, and then not replacing
 * it when the browser interprets it. So instead of inlining our JS, we create
 * an object url and add a <script src="<object-url>" /> to the body. This gets
 * around our parsing error.
 */
function injectJS(body: HTMLElement) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  const content = `
      var links = document.querySelectorAll( 'a' );
      function handleLinkClick(evt) {
        // don't navigate
        evt.preventDefault();
        const  href = evt.currentTarget.href;
        if(href) {
          // send message to parent
          window.parent.postMessage( { type: 'LINK_CLICKED', href  } );
        }
      };
      for ( var i = 0; i < links.length; i ++ ) {
        links[i].addEventListener('click', handleLinkClick);
      }
  `;
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  script.src = url;

  body.appendChild(script);
}
