import {
  Box,
  Flex,
  Skeleton,
  SkeletonText,
  ThemeProvider,
} from '@chakra-ui/react';
import React from 'react';
import { HtmlState } from '../HtmlReader/types';
import { ReaderState } from '../types';
import { HeaderWrapper } from './Header';
import useColorModeValue from './hooks/useColorModeValue';
import { getTheme } from './theme';

const LoadingSkeletonContent = ({
  height,
}: {
  height: string;
}): JSX.Element => {
  const bgColor = useColorModeValue('ui.white', 'ui.black', 'ui.sepia');
  return (
    <>
      <HeaderWrapper bg={bgColor} />
      <Box
        padding="6"
        bg={bgColor}
        mt="0"
        height={height}
        aria-label="Loading book..."
        aria-busy="true"
        role="progressbar"
      >
        <Flex justifyContent="center">
          <Skeleton height="20px" mb="7" w="30%" />
        </Flex>
        <SkeletonText mb="7" noOfLines={10} spacing="4" />
        <SkeletonText mb="7" noOfLines={5} spacing="4" />
      </Box>
    </>
  );
};

// state can be in any state, we will just accept all since it's just a skeleton loader
type AnyState = HtmlState | ReaderState | undefined | null;
export default function LoadingSkeleton({
  height,
  state,
}: {
  height: string;
  state: AnyState;
}): JSX.Element {
  return (
    <ThemeProvider theme={getTheme(state?.settings?.colorMode)}>
      <LoadingSkeletonContent height={height} />
    </ThemeProvider>
  );
}
