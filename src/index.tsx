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

export { default as useWebReader } from './useWebReader';
export { default as useHtmlReader } from './HtmlReader';
export { default as usePdfReader } from './PdfReader';
export { getTheme } from './ui/theme';
export { default as useColorModeValue } from './ui/hooks/useColorModeValue';
export * from './constants';
export { clearWebReaderLocalStorage } from './utils/localstorage';
export { default as addTocToManifest } from './PdfReader/addTocToManifest';
export type { ReadiumLink } from './WebpubManifestTypes/ReadiumLink';
export type { WebpubManifest } from './WebpubManifestTypes/WebpubManifest';
