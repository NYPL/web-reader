import { ButtonGroup, Icon } from '@chakra-ui/react';
import * as React from 'react';
import { PdfNavigator } from '../types';
import Button from './Button';
import ZoomIn from './icons/ZoomIn';
import ZoomOut from './icons/ZoomOut';
import Tooltip from './Tooltip';

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
      <Tooltip content="Zoom in">
        <Button aria-label="Zoom in" onClick={zoomIn} isIcon>
          <Icon as={ZoomIn} w={6} h={6} />
        </Button>
      </Tooltip>
      <Tooltip content="Zoom out">
        <Button aria-label="Zoom out" onClick={zoomOut} isIcon>
          <Icon as={ZoomOut} w={6} h={6} />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}
