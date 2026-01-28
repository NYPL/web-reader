import * as React from 'react';
import { ButtonGroup, Icon } from '@chakra-ui/react';
import Button from './Button';
import { HtmlNavigator, ReaderState } from '../types';
import { ZoomIn, ZoomOut } from './icons';

export type HtmlFontSizeControlsProps = {
  navigator: HtmlNavigator;
  iconFill: string;
  readerState: ReaderState;
};

export default function HtmlFontSizeControls(
  props: HtmlFontSizeControlsProps
): React.ReactElement | null {
  const { navigator, iconFill, readerState } = props;

  if (!readerState.settings) return null;

  const { decreaseFontSize, increaseFontSize } = navigator;

  return (
    <ButtonGroup display="flex" spacing={2}>
      <Button aria-label="Increase font size" onClick={increaseFontSize}>
        <Icon as={ZoomIn} fill={iconFill} w={6} h={6} />
      </Button>
      <Button aria-label="Decrease font size" onClick={decreaseFontSize}>
        <Icon as={ZoomOut} fill={iconFill} w={6} h={6} />
      </Button>
    </ButtonGroup>
  );
}
