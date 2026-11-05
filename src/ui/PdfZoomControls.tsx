import { ButtonGroup, Icon } from '@chakra-ui/react';
import * as React from 'react';
import { PdfNavigator, WebReaderUiEvent } from '../types';
import Button from './Button';
import ZoomIn from './icons/ZoomIn';
import ZoomOut from './icons/ZoomOut';
import Tooltip from './Tooltip';

export type PdfZoomControlsProps = {
  navigator: PdfNavigator;
  onTrackEvent?: (event: WebReaderUiEvent) => void;
};

export default function PdfZoomControls(
  props: PdfZoomControlsProps
): React.ReactElement {
  const { navigator, onTrackEvent } = props;
  const { zoomOut, zoomIn } = navigator;

  const handleZoomIn = () => {
    zoomIn();
    onTrackEvent?.({ uiText: 'Zoom in', uiState: 'zoom in' });
  };

  const handleZoomOut = () => {
    zoomOut();
    onTrackEvent?.({ uiText: 'Zoom out', uiState: 'zoom out' });
  };

  return (
    <ButtonGroup display="flex" spacing={2}>
      <Tooltip content="Zoom in">
        <Button aria-label="Zoom in" onClick={handleZoomIn} isIcon>
          <Icon as={ZoomIn} w={18} h={18} />
        </Button>
      </Tooltip>
      <Tooltip content="Zoom out">
        <Button aria-label="Zoom out" onClick={handleZoomOut} isIcon>
          <Icon as={ZoomOut} w={18} h={18} />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}
