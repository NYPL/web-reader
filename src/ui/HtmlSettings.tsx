import { Box, Heading, Text } from '@chakra-ui/react';
import * as React from 'react';
import { FONT_DETAILS } from '../constants';
import { HtmlNavigator, ReaderState } from '../types';
import useColorModeValue from './hooks/useColorModeValue';
import { Day, Night, Sepia } from './icons';
import Tabs from './Tabs';
import { ColorModeToggleButton } from './ToggleButton';
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

  if (!readerState.settings) return null;
  const { colorMode, fontFamily } = readerState.settings;

  const { setFontFamily, setColorMode } = navigator;

  return (
    <>
      <Tabs
        value={fontFamily}
        onChange={(value: string) => {
          setFontFamily(value as typeof fontFamily);
        }}
        options={[
          { label: 'Default', value: 'publisher' },
          {
            label: 'Serif',
            value: 'serif',
            fontFamily: 'serif',
            fontWeight: 'regular',
          },
          {
            label: 'Sans-Serif',
            value: 'sans-serif',
            fontFamily: 'body',
            fontWeight: 'regular',
          },
          {
            label: 'Dyslexia',
            value: 'open-dyslexic',
            fontFamily: 'opendyslexic',
            fontWeight: 'regular',
          },
        ]}
      />
      <Box
        bgColor={checkedButtonBgColor}
        display="flex"
        flexDirection="column"
        p={4}
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
      </Box>
    </>
  );
}
