import { Flex, HStack, Icon, Input, Text } from '@chakra-ui/react';
import React, { ComponentProps } from 'react';
import { ActiveReader } from '../types';
import useColorModeValue from '../ui/hooks/useColorModeValue';
import Button from './Button';
import useFullscreen from './hooks/useFullScreen';
import HtmlFontSizeControls from './HtmlFontSizeControls';
import {
  PageDown,
  PageUp,
  Reset,
  Search,
  ToggleFullScreen,
  ToggleFullScreenExit,
} from './icons';
import FitHeightWidth from './icons/FitHeightWidth';
import PdfZoomControls from './PdfZoomControls';
import SettingsCard from './SettingsButton';
import SkipNavigation from './SkipNavigation';
import TableOfContent from './TableOfContent';

export default function Header(
  props: ActiveReader & {
    containerRef: React.MutableRefObject<null | HTMLDivElement>;
    totalPages: number;
    currentPage: number;
  }
): React.ReactElement {
  const [isFullscreen, toggleFullScreen] = useFullscreen();
  const {
    navigator,
    manifest,
    type,
    containerRef,
    currentPage,
    totalPages,
  } = props;
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

  const pageUp = () => {
    if (currentPage > 1) {
      navigator.goBackward();
    }
  };

  const pageDown = () => {
    if (currentPage < totalPages) {
      navigator.goForward();
    }
  };

  return (
    <HeaderWrapper
      bg={mainBgColor}
      borderBottom="1px solid"
      borderColor="ui.gray.x-dark"
      px={4}
      py={2}
    >
      <SkipNavigation />
      <HStack mr="auto" spacing={2}>
        {type === 'PDF' && <PdfZoomControls navigator={navigator} />}
        {type === 'HTML' && (
          <HtmlFontSizeControls
            navigator={navigator}
            iconFill={iconFill}
            readerState={props.state}
          />
        )}
        <Button
          isIcon
          onClick={toggleFitMode}
          aria-label={fitMode === 'width' ? 'Fit to width' : 'Fit to height'}
        >
          <Icon
            as={FitHeightWidth}
            fitMode={fitMode === 'width' ? 'width' : 'height'}
            w={6}
            h={6}
          />
        </Button>
        <Button isIcon onClick={navigator.resetSettings}>
          <Icon as={Reset} w={6} h={6} />
        </Button>
      </HStack>
      <HStack mx="auto" spacing={2}>
        <Button
          onClick={pageUp}
          aria-label="Previous Page"
          isDisabled={currentPage <= 1}
          isIcon
        >
          <Icon as={PageUp} w={6} h={6} />
        </Button>
        <HStack color="ui.white" spacing={2} fontSize="sm" alignItems="center">
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
        <Button
          onClick={pageDown}
          aria-label="Next Page"
          isDisabled={currentPage >= totalPages}
          isIcon
        >
          <Icon as={PageDown} w={6} h={6} />
        </Button>
      </HStack>
      <HStack ml="auto" spacing={2}>
        <Button isIcon>
          <Icon as={Search} w={6} h={6} />
        </Button>
        <TableOfContent
          containerRef={containerRef}
          navigator={navigator}
          manifest={manifest}
        />
        <Button
          aria-expanded={isFullscreen}
          aria-label="Toggle full screen"
          border="none"
          bgColor={mainBgColor}
          onClick={toggleFullScreen}
          isIcon
        >
          <Icon
            as={isFullscreen ? ToggleFullScreenExit : ToggleFullScreen}
            w={6}
            h={6}
          />
        </Button>
        {type === 'HTML' && <SettingsCard {...props} />}
      </HStack>
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
      as="header"
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
