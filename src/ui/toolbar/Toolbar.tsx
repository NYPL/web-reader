import { Flex, Grid, GridItem } from '@chakra-ui/react';
import React, { ComponentProps, useEffect, useState } from 'react';
import { ActiveReader } from '../../types';
import useColorModeValue from '../hooks/useColorModeValue';
import useFullscreen from '../hooks/useFullScreen';
import SkipNavigation from '../SkipNavigation';
import DocActions from './DocActions';
import PageNavigation from './PageNavigation';
import ViewControls from './ViewControls';

export default function Toolbar(
  props: ActiveReader & {
    containerRef: React.MutableRefObject<null | HTMLDivElement>;
    totalPages: number;
    currentPage: number;
    toggleFullScreen?: () => void;
  }
): React.ReactElement {
  const [isFullscreenHook, toggleFullscreenHook] = useFullscreen();
  const [isReaderFullScreen, setIsReaderFullscreen] = useState(false);
  const { navigator, containerRef, currentPage, totalPages, toggleFullScreen } =
    props;

  const isFullScreen = toggleFullScreen ? isReaderFullScreen : isFullscreenHook;

  const isAtStart = props.state?.atStart;
  const isAtEnd = props.state?.atEnd;

  const mainBgColor = useColorModeValue(
    'ui.gray.xx-dark',
    'ui.black',
    'ui.sepia'
  );

  const fitMode = props.state?.fitMode ?? 'width';

  const [inputValue, setInputValue] = React.useState<string | number>(
    currentPage
  );
  React.useEffect(() => {
    setInputValue(currentPage);
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (navigator) {
      navigator.goToPageNumber(page);
    }
  };

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val ? parseInt(val, 10) : '');
  };

  const inputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      inputValue &&
      Number(inputValue) >= 1 &&
      Number(inputValue) <= totalPages
    ) {
      goToPage(Number(inputValue));
    }
  };

  const handleFullscreen = React.useCallback(() => {
    if (toggleFullScreen) {
      toggleFullScreen();
      setIsReaderFullscreen((prev) => !prev);
    } else {
      toggleFullscreenHook();
    }
  }, [toggleFullScreen, toggleFullscreenHook]);

  useEffect(() => {
    if (!toggleFullScreen || !isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFullscreen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFullscreen, isFullScreen, toggleFullScreen]);

  return (
    <ToolbarWrapper
      bg={mainBgColor}
      borderBottom="1px solid"
      borderColor="ui.gray.x-dark"
      px={4}
      py={2}
      sx={{ containerType: 'inline-size', containerName: 'reader-toolbar' }}
    >
      <SkipNavigation />
      <Grid
        width="100%"
        rowGap="8px"
        columnGap={4}
        alignItems="center"
        templateAreas={`"nav nav" "divider divider" "view actions"`}
        templateColumns="1fr 1fr"
        sx={{
          '@container reader-toolbar (min-width: 479px)': {
            gridTemplateAreas: `"view nav actions"`,
            gridTemplateColumns: '1fr auto 1fr',
          },
        }}
      >
        <GridItem area="view">
          <ViewControls reader={props} fitMode={fitMode} />
        </GridItem>
        <GridItem area="nav" justifySelf="center">
          <PageNavigation
            navigator={navigator}
            isAtStart={isAtStart}
            isAtEnd={isAtEnd}
            totalPages={totalPages}
            inputValue={inputValue}
            onInputChange={inputChange}
            onInputKeyDown={inputKeyDown}
          />
        </GridItem>
        <GridItem area="actions" justifySelf="end">
          <DocActions
            reader={props}
            containerRef={containerRef}
            isFullScreen={isFullScreen}
            handleFullscreen={handleFullscreen}
            mainBgColor={mainBgColor}
          />
        </GridItem>
        <GridItem
          area="divider"
          sx={{
            hr: {
              borderColor: '#424242',
              marginInline: '-16px',
            },
            '@container reader-toolbar (min-width: 479px)': {
              display: 'none',
            },
          }}
        >
          <hr />
        </GridItem>
      </Grid>
    </ToolbarWrapper>
  );
}

export const ToolbarWrapper = React.forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Flex>
>(({ children, ...rest }, ref) => {
  return (
    <Flex
      ref={ref}
      role="region"
      aria-label="Reader controls"
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={{ base: 'auto', md: 'sticky' }}
      alignContent="space-between"
      alignItems="center"
      borderBottom="1px solid"
      borderColor="gray.100"
      {...rest}
    >
      {children}
    </Flex>
  );
});
