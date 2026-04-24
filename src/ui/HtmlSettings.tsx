import {
  Box,
  ButtonGroup,
  Heading,
  Icon,
  Text,
  useMultiStyleConfig,
} from '@chakra-ui/react';
import * as React from 'react';
import { FONT_DETAILS } from '../constants';
import { HtmlNavigator, ReaderState } from '../types';
import Button from './Button';
import useColorModeValue from './hooks/useColorModeValue';
import { Day, Night, Reset, Sepia, ZoomIn, ZoomOut } from './icons';
import ToggleButton, { ColorModeToggleButton } from './ToggleButton';
import ToggleGroup from './ToggleGroup';

export type HtmlSettingsProps = {
  navigator: HtmlNavigator;
  iconFill: string;
  readerState: ReaderState;
  paginationValue: string;
};

export default function HtmlSettings(
  props: HtmlSettingsProps
): React.ReactElement | null {
  const { navigator, readerState } = props;

  const buttonTextColor = useColorModeValue('ui.black', 'ui.white', 'ui.black');
  const checkedButtonBgColor = useColorModeValue(
    'ui.gray.light-warm',
    'ui.gray.x-dark',
    'ui.sepiaChecked'
  );

  const fontFamilyToggleStyles = useMultiStyleConfig('FontFamilyToggle', {
    variant: 'custom',
  });
  const toggleButtonStyles = fontFamilyToggleStyles.button ?? {};

  if (!readerState.settings) return null;
  const { colorMode, fontFamily } = readerState.settings;

  const {
    decreaseFontSize,
    increaseFontSize,
    resetSettings,
    setFontFamily,
    setColorMode,
  } = navigator;

  return (
    <>
      <ToggleGroup
        value={fontFamily}
        label="font family options"
        onChange={(value: string) => {
          setFontFamily(value as typeof fontFamily);
        }}
        gap={0}
        width="100%"
        sx={{ '& > label': { flex: 1 } }}
      >
        <ToggleButton
          value="publisher"
          label="Default"
          width="full"
          sx={toggleButtonStyles}
        />
        <ToggleButton
          value="serif"
          label="Serif"
          fontFamily="serif"
          width="full"
          sx={toggleButtonStyles}
        />
        <ToggleButton
          value="sans-serif"
          label="Sans-serif"
          fontFamily="body"
          width="full"
          sx={toggleButtonStyles}
        />
        <ToggleButton
          value="open-dyslexic"
          label="Dyslexia"
          fontFamily="opendyslexic"
          width="full"
          sx={toggleButtonStyles}
        />
      </ToggleGroup>
      <Box
        bgColor={checkedButtonBgColor}
        display="flex"
        flexDirection="column"
        p={4}
        gap={4}
      >
        <Heading
          as="h3"
          color={buttonTextColor}
          fontSize="18px"
          fontWeight="bold"
          mb={2}
        >
          {FONT_DETAILS[fontFamily].heading}
        </Heading>
        <Text
          color={buttonTextColor}
          fontFamily={FONT_DETAILS[fontFamily].token}
          fontSize={-1}
          fontWeight={FONT_DETAILS[fontFamily].fontWeight}
          margin={0}
          mb={4}
        >
          {FONT_DETAILS[fontFamily].body}
        </Text>
        <ToggleGroup
          value={colorMode}
          label="reading theme options"
          onChange={setColorMode}
        >
          <ColorModeToggleButton
            colorMode="day"
            icon={Day}
            value="day"
            label="Day"
            bgColor="ui.white"
            textColor="ui.black"
          />
          <ColorModeToggleButton
            colorMode="night"
            icon={Night}
            value="night"
            label="Night"
            bgColor="ui.black"
            textColor="ui.white"
          />
          <ColorModeToggleButton
            colorMode="sepia"
            icon={Sepia}
            value="sepia"
            label="Sepia"
            bgColor="ui.sepia"
            textColor="ui.black"
          />
        </ToggleGroup>
        <ButtonGroup display="flex" spacing={4}>
          <Button
            onClick={resetSettings}
            aria-label="Reset all"
            bgColor="ui.white"
            width="150px"
          >
            <Icon
              as={Reset}
              w={18}
              h={18}
              mr={1.5}
              sx={{
                path: { stroke: 'ui.typography.body' },
              }}
            />
            Reset all
          </Button>
          <Button
            onClick={increaseFontSize}
            aria-label="Increase text"
            bgColor="ui.white"
            width="150px"
            sx={{
              _active: {
                bgColor: checkedButtonBgColor,
              },
            }}
          >
            <Icon
              as={ZoomIn}
              w={18}
              h={18}
              mr={1.5}
              sx={{
                path: { stroke: 'ui.typography.body' },
              }}
            />
            Increase text
          </Button>
          <Button
            onClick={decreaseFontSize}
            aria-label="Decrease text"
            bgColor="ui.white"
            width="150px"
            sx={{
              _active: {
                bgColor: checkedButtonBgColor,
              },
            }}
          >
            <Icon
              as={ZoomOut}
              w={18}
              h={18}
              mr={1.5}
              sx={{
                path: { stroke: 'ui.typography.body' },
              }}
            />
            Decrease text
          </Button>
        </ButtonGroup>
      </Box>
    </>
  );
}
