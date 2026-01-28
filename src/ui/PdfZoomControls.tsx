import * as React from 'react';
import { ButtonGroup, Icon } from '@chakra-ui/react';
import { PdfNavigator } from '../types';
import Button from './Button';
import ZoomOut from './icons/ZoomOut';
import ZoomIn from './icons/ZoomIn';

export type PdfZoomControlsProps = {
  navigator: PdfNavigator;
};

export default function PdfZoomControls(
  props: PdfZoomControlsProps
): React.ReactElement {
  const { navigator } = props;
  const { zoomOut, zoomIn } = navigator;

  return (
    <ButtonGroup display="flex" spacing={2}>
      <Button aria-label="Zoom In" onClick={zoomIn}>
        <Icon as={ZoomIn} w={6} h={6} />
      </Button>
      <Button aria-label="Zoom Out" onClick={zoomOut}>
        <Icon as={ZoomOut} w={6} h={6} />
      </Button>
    </ButtonGroup>
  );
}
