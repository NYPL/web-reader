import React from 'react';
import { usePdfReader } from '../src';
import { WebpubManifest } from '../src/types';
import Header from '../src/ui/Header';

type PDFReaderProps = {
  webpubManifestUrl: string;
  manifest: WebpubManifest;
  proxyUrl: string | undefined;
  pdfWorkerSrc: string;
};

/**
 * This sample shows setting how to use the usePdfReader hook
 * to render PDFs. Use it when you know you're _not_ going to be
 * opening EPUBs.
 */
const UsePdfReader: React.FC<PDFReaderProps> = ({
  webpubManifestUrl,
  manifest,
  proxyUrl,
  pdfWorkerSrc,
}) => {
  const reader = usePdfReader({
    webpubManifestUrl,
    manifest,
    proxyUrl,
    pdfWorkerSrc,
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (!reader || !reader.type) {
    return null;
  }

  const { content } = reader;
  return (
    <div>
      <Header {...reader} containerRef={containerRef} />
      {content}
    </div>
  );
};

export default UsePdfReader;
