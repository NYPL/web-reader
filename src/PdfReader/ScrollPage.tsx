import React, { FC } from 'react';
import ChakraPage from './ChakraPage';
import { useInView } from 'react-intersection-observer';
import { PageProps } from 'react-pdf';

type ScrollPageProps = {
  pageNumber: number;
  width: number | undefined;
  scale: number;
  onLoadSuccess: (page: PageProps) => void;
  placeholderHeight: number;
  placeholderWidth: number;
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
  onLoadSuccess,
  placeholderHeight,
  placeholderWidth,
}) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <ChakraPage
          // data-page-number is used in Cypress tests
          data-page-number={pageNumber}
          pageNumber={pageNumber}
          scale={scale}
          width={width}
          onLoadSuccess={onLoadSuccess}
          loading={
            <p
              style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              Loading PDF content...
            </p>
          }
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
