import { HStack, Icon } from '@chakra-ui/react';
import React from 'react';
import { ActiveReader, WebReaderUiEvent } from '../../types';
import Button from '../Button';
import useColorModeValue from '../hooks/useColorModeValue';
import HtmlFontSizeControls from '../HtmlFontSizeControls';
import { FitHeightWidth, Rotate } from '../icons';
import PdfZoomControls from '../PdfZoomControls';
import Tooltip from '../Tooltip';

interface ViewControlsProps {
  reader: ActiveReader;
  fitMode: 'width' | 'height';
  onTrackEvent?: (event: WebReaderUiEvent) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  reader,
  fitMode,
  onTrackEvent,
}) => {
  const { type, navigator, state: readerState } = reader;

  const iconFill = useColorModeValue(
    'ui.gray.icon',
    'ui.white',
    'ui.gray.icon'
  );

  const toggleFitMode = () => {
    const nextFitMode = fitMode === 'width' ? 'height' : 'width';
    navigator.setFitMode(nextFitMode);
    onTrackEvent?.({
      uiText: nextFitMode === 'width' ? 'Fit to width' : 'Fit to height',
      uiState: nextFitMode === 'width' ? 'fit to width' : 'fit to height',
    });
  };

  return (
    <HStack spacing={2}>
      {type === 'PDF' && (
        <PdfZoomControls navigator={navigator} onTrackEvent={onTrackEvent} />
      )}
      {type === 'HTML' && (
        <HtmlFontSizeControls
          navigator={navigator}
          iconFill={iconFill}
          readerState={readerState}
        />
      )}
      <Tooltip content={fitMode === 'width' ? 'Fit to height' : 'Fit to width'}>
        <Button
          isIcon
          onClick={toggleFitMode}
          aria-label={fitMode === 'width' ? 'Fit to height' : 'Fit to width'}
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
            onClick={() => {
              navigator.rotateCounterClockwise();
              onTrackEvent?.({ uiText: 'Rotate left', uiState: 'rotate left' });
            }}
            aria-label="Rotate left"
          >
            <Icon as={Rotate} w={18} h={18} />
          </Button>
        </Tooltip>
      )}
    </HStack>
  );
};

export default ViewControls;
