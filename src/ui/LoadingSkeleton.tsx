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
import useColorModeValue from './hooks/useColorModeValue';
import { getTheme } from './theme';
import { ToolbarWrapper } from './toolbar/Toolbar';

const LoadingSkeletonContent = ({
  height,
}: {
  height: string;
}): JSX.Element => {
  const bgColor = useColorModeValue('ui.white', 'ui.black', 'ui.sepia');
  return (
    <>
      <ToolbarWrapper bg={bgColor} />
      <Box padding="16px" bgColor="ui.gray.xxx-dark">
        <Box
          px="48px"
          py="110px"
          bg={bgColor}
          mt="0"
          height={height}
          aria-label="Loading book..."
          aria-busy="true"
          role="progressbar"
        >
          <Flex justifyContent="center">
            <Skeleton h="32px" mb="6" w="100%" maxW="280px" />
          </Flex>
          <SkeletonText
            mb="6"
            noOfLines={6}
            skeletonHeight="16px"
            spacing="2"
          />
          <SkeletonText
            mb="6"
            noOfLines={6}
            skeletonHeight="16px"
            spacing="2"
          />
          <SkeletonText
            mb="6"
            noOfLines={6}
            skeletonHeight="16px"
            spacing="2"
          />
          <SkeletonText noOfLines={6} skeletonHeight="16px" spacing="2" />
        </Box>
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
