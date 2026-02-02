import React, { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { PageProps } from 'react-pdf';
import { FitMode } from '../types';
import ChakraPage from './ChakraPage';

type ScrollPageProps = {
  pageNumber: number;
  width: number | undefined;
  height: number | undefined;
  scale: number;
  onLoadSuccess: (page: PageProps) => void;
  placeholderHeight: number;
  placeholderWidth: number;
  allowInView?: boolean;
  onInView?: (pageNumber: number, ratio: number) => void;
  fitMode: FitMode;
};

type PlaceholderProps = {
  height: number;
  width: number | undefined;
  pageNumber: number;
};

const Placeholder: FC<PlaceholderProps> = ({ width, height, pageNumber }) => {
  return (
    <div
      // data-page-number is used in Cypress tests
      data-page-number={pageNumber}
      style={{ width: width, height: height }}
    />
  );
};

const ScrollPage: FC<ScrollPageProps> = ({
  scale,
  pageNumber,
  width,
  height,
  onLoadSuccess,
  placeholderHeight,
  placeholderWidth,
  allowInView,
  onInView,
  fitMode,
}) => {
  const { ref, inView, entry } = useInView({
    threshold: Array.from({ length: 11 }, (_, i) => i * 0.1),
    triggerOnce: false,
  });

  const handleLoadSuccess = React.useCallback(
    (page: PageProps) => {
      onLoadSuccess(page);
    },
    [onLoadSuccess]
  );

  React.useEffect(() => {
    if (onInView && entry && allowInView) {
      onInView(pageNumber, entry.intersectionRatio || 0);
    }
  }, [allowInView, entry, onInView, pageNumber]);

  return (
    <div ref={ref}>
      {inView ? (
        <ChakraPage
          // data-page-number is used in Cypress tests
          data-page-number={pageNumber}
          pageNumber={pageNumber}
          scale={scale}
          width={width}
          height={height}
          onLoadSuccess={handleLoadSuccess}
          fitMode={fitMode}
        />
      ) : (
        <Placeholder
          width={placeholderWidth}
          height={placeholderHeight}
          pageNumber={pageNumber}
        />
      )}
    </div>
  );
};

export default ScrollPage;
