import { Box } from '@chakra-ui/react';
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
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <Box display="flex" flexDirection="column" height="100vh" marginTop="16px">
      {newReader.type && <Header {...newReader} containerRef={containerRef} />}
      <Box
        ref={containerRef}
        flex="1 1 auto"
        position="relative"
        overflow="hidden"
      >
        {newReader.content}
      </Box>
    </Box>
  );
};

export default UseNewPdfReader;
