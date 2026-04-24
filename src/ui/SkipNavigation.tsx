import { Box, Link, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

/**
 * SkipNavigation is a component that is used to provide a link
 * used to skip to the reader content of the page using the `#reader-content`
 * id. This link is visually hidden but can be read by screenreaders.
 */
export const SkipNavigation = (): React.ReactElement => {
  const styles = useStyleConfig('SkipNavigation');

  return (
    <Box __css={styles}>
      <Link href="#reader-content" textDecoration="none" zIndex="skipLink">
        Skip to book contents
      </Link>
    </Box>
  );
};

export default SkipNavigation;
