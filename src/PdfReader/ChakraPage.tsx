import { chakra, shouldForwardProp } from '@chakra-ui/react';
import React from 'react';
import { Page, PageProps } from 'react-pdf';
import { FitMode } from '../types';

interface ChakraPageProps extends Omit<PageProps, 'width' | 'height'> {
  width?: number;
  height?: number;
  fitMode: FitMode;
}

// Wrap Page component so that we can pass it styles
const ChakraPage = chakra(
  ({ width, height, fitMode, ...rest }: ChakraPageProps) => (
    <Page
      {...rest}
      width={fitMode === 'width' ? width : undefined}
      height={fitMode === 'height' ? height : undefined}
    />
  ),
  {
    shouldForwardProp: (prop) => {
      // Forward width, height, scale, fitMode, and react-pdf props
      if (
        [
          'width',
          'height',
          'scale',
          'fitMode',
          'pageNumber',
          'rotate',
          'onLoadSuccess',
          'renderAnnotationLayer',
          'renderTextLayer',
          'loading',
        ].includes(prop)
      )
        return true;
      // don't forward the rest of Chakra's props
      const isChakraProp = !shouldForwardProp(prop);
      if (isChakraProp) return false;
      return true;
    },
    baseStyle: {
      outline: '1px',
      outlineColor: 'ui.gray.light-cool',
    },
  }
);

export default ChakraPage;
