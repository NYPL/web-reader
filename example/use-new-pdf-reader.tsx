import React from 'react';
import { useNewReader } from '../src';
import { WebpubManifest } from '../src/types';
import Header from '../src/ui/Header';

type UseNewPdfReaderProps = {
  webpubManifestUrl: string;
  manifest: WebpubManifest;
  proxyUrl?: string;
  pdfWorkerSrc?: string;
};

const UseNewPdfReader: React.FC<UseNewPdfReaderProps> = ({
  webpubManifestUrl,
  manifest,
  proxyUrl,
  pdfWorkerSrc,
}) => {
  const newReader = useNewReader({
    webpubManifestUrl,
    manifest,
    proxyUrl,
    pdfWorkerSrc,
    height: '80vh',
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      {newReader.type && <Header {...newReader} containerRef={containerRef} />}
      {newReader.content}
    </div>
  );
};

export default UseNewPdfReader;
