import React, { FC } from 'react';
import { UseWebReaderArguments } from './types';
import ErrorBoundary from './ui/ErrorBoundary';
import ManagerUI from './ui/manager';
import useWebReader from './useWebReader';

/**
 * The main React component export.
 */

export type WebReaderProps = UseWebReaderArguments<string | Uint8Array>;

export const WebReaderWithoutBoundary: FC<WebReaderProps> = ({
  webpubManifestUrl,
  proxyUrl,
  getContent,
  ...props
}) => {
  const webReader = useWebReader({
    webpubManifestUrl,
    proxyUrl,
    getContent,
    ...props,
  });
  const { content } = webReader;

  return <ManagerUI {...webReader}>{content}</ManagerUI>;
};

const WebReader: FC<WebReaderProps> = (props) => {
  return (
    <ErrorBoundary {...props}>
      <WebReaderWithoutBoundary {...props} />
    </ErrorBoundary>
  );
};

export default WebReader;

export * from './constants';
export { default as useHtmlReader } from './HtmlReader';
export { default as NewReader, useNewReader } from './NewReader';
export { default as usePdfReader } from './PdfReader';
export { default as addTocToManifest } from './PdfReader/addTocToManifest';
export { default as useColorModeValue } from './ui/hooks/useColorModeValue';
export { getTheme } from './ui/theme';
export { default as useWebReader } from './useWebReader';
export { clearWebReaderLocalStorage } from './utils/localstorage';
export type { ReadiumLink } from './WebpubManifestTypes/ReadiumLink';
export type { WebpubManifest } from './WebpubManifestTypes/WebpubManifest';
