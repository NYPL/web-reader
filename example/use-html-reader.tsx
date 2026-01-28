import React from 'react';
import { useHtmlReader } from '../src';
import { Injectable } from '../src/Readium/Injectable';
import { WebpubManifest } from '../src/types';
import Header from '../src/ui/Header';

type HTMLReaderProps = {
  injectablesReflowable: Injectable[];
  webpubManifestUrl: string;
  manifest: WebpubManifest;
};

/**
 * This sample shows setting how to use the useHTMLReader hook
 * to render EPUBs. Use it when you know you're _not_ going to be
 * opening PDFs.
 */
const UseHtmlReader: React.FC<HTMLReaderProps> = ({
  injectablesReflowable,
  webpubManifestUrl,
  manifest,
}) => {
  const reader = useHtmlReader({
    webpubManifestUrl,
    manifest,
    injectablesReflowable,
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (!reader || !reader.type) {
    return null;
  }

  return (
    <div>
      <Header {...reader} containerRef={containerRef} />
      {reader.content}
    </div>
  );
};

export default UseHtmlReader;
