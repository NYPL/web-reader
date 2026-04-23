import { Flex, HStack, Icon, Input, Spacer, Text } from '@chakra-ui/react';
import React, { ComponentProps, useEffect, useState } from 'react';
import { ActiveReader } from '../types';
import useColorModeValue from '../ui/hooks/useColorModeValue';
import Button from './Button';
import useFullscreen from './hooks/useFullScreen';
import HtmlFontSizeControls from './HtmlFontSizeControls';
import {
  PageDown,
  PageUp,
  Rotate,
  ToggleFullScreen,
  ToggleFullScreenExit,
} from './icons';
import FitHeightWidth from './icons/FitHeightWidth';
import PdfZoomControls from './PdfZoomControls';
import SettingsCard from './SettingsButton';
import SkipNavigation from './SkipNavigation';
import TableOfContent from './TableOfContent';
import Tooltip from './Tooltip';

export default function Header(
  props: ActiveReader & {
    containerRef: React.MutableRefObject<null | HTMLDivElement>;
    totalPages: number;
    currentPage: number;
    toggleFullScreen?: () => void;
  }
): React.ReactElement {
  const [, toggleFullscreenHook] = useFullscreen();
  const [isFullscreen, setIsFullScreen] = useState(false);
  const { navigator, manifest, type, containerRef, currentPage, totalPages } =
    props;

  const isAtStart = props.state?.atStart;
  const isAtEnd = props.state?.atEnd;

  const iconFill = useColorModeValue(
    'ui.gray.icon',
    'ui.white',
    'ui.gray.icon'
  );
  const mainBgColor = useColorModeValue(
    'ui.gray.xx-dark',
    'ui.black',
    'ui.sepia'
  );

  const fitMode = props.state?.fitMode ?? 'width';

  const toggleFitMode = () => {
    navigator.setFitMode(fitMode === 'width' ? 'height' : 'width');
  };

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
    if (props.toggleFullScreen) {
      props.toggleFullScreen();
      setIsFullScreen((prev) => !prev);
    } else {
      toggleFullscreenHook();
      setIsFullScreen((prev) => !prev);
    }
  }, [props, toggleFullscreenHook]);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFullscreen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFullscreen, isFullscreen]);

  return (
    <HeaderWrapper
      bg={mainBgColor}
      borderBottom="1px solid"
      borderColor="ui.gray.x-dark"
      px={4}
      py={2}
    >
      <SkipNavigation />
      <Flex width="100%" alignItems="center" position="relative">
        <HStack spacing={2}>
          {type === 'PDF' && <PdfZoomControls navigator={navigator} />}
          {type === 'HTML' && (
            <HtmlFontSizeControls
              navigator={navigator}
              iconFill={iconFill}
              readerState={props.state}
            />
          )}
          <Tooltip
            content={fitMode === 'width' ? 'Fit to height' : 'Fit to width'}
          >
            <Button
              isIcon
              onClick={toggleFitMode}
              aria-label={
                fitMode === 'width' ? 'Fit to height' : 'Fit to width'
              }
            >
              <Icon
                as={FitHeightWidth}
                fitMode={fitMode === 'width' ? 'width' : 'height'}
                w={18}
                h={18}
              />
            </Button>
          </Tooltip>
          {type === 'PDF' && (
            <Tooltip content="Rotate left">
              <Button
                isIcon
                onClick={navigator.rotateCounterClockwise}
                aria-label="Rotate left"
              >
                <Icon as={Rotate} w={18} h={18} />
              </Button>
            </Tooltip>
          )}
        </HStack>
        <Spacer />
        <HStack
          spacing={2}
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
        >
          <Tooltip content="Previous page">
            <Button
              onClick={navigator.goBackward}
              aria-label="Previous page"
              isDisabled={isAtStart}
              isIcon
            >
              <Icon as={PageUp} w={18} h={18} />
            </Button>
          </Tooltip>
          <HStack
            color="ui.white"
            spacing={2}
            fontSize="sm"
            alignItems="center"
          >
            <Input
              aria-label="Current page number"
              width="2rem"
              height="2rem"
              padding={0}
              bg="ui.gray.x-dark"
              border="none"
              textAlign="center"
              borderRadius="4px"
              _focus={{ outline: 'none', boxShadow: 'none' }}
              min="1"
              max={totalPages}
              type="number"
              value={inputValue}
              onChange={inputChange}
              onKeyDown={inputKeyDown}
              id="currentPageInput"
            />
            <Text>/</Text>
            <Text>{totalPages}</Text>
          </HStack>
          <Tooltip content="Next page">
            <Button
              onClick={navigator.goForward}
              aria-label="Next page"
              isDisabled={isAtEnd}
              isIcon
            >
              <Icon as={PageDown} w={18} h={18} />
            </Button>
          </Tooltip>
        </HStack>
        <Spacer />
        <HStack spacing={2}>
          <TableOfContent
            containerRef={containerRef}
            navigator={navigator}
            manifest={manifest}
          />
          <Tooltip
            content={
              isFullscreen ? 'Exit full screen mode' : 'Enter full screen mode'
            }
          >
            <Button
              aria-expanded={isFullscreen}
              aria-label={
                isFullscreen
                  ? 'Exit full screen mode'
                  : 'Enter full screen mode'
              }
              border="none"
              bgColor={mainBgColor}
              onClick={handleFullscreen}
              isIcon
            >
              <Icon
                as={isFullscreen ? ToggleFullScreenExit : ToggleFullScreen}
                w={18}
                h={18}
              />
            </Button>
          </Tooltip>
          {type === 'HTML' && <SettingsCard {...props} />}
        </HStack>
      </Flex>
    </HeaderWrapper>
  );
}

export const HeaderWrapper = React.forwardRef<
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
      zIndex="sticky"
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
