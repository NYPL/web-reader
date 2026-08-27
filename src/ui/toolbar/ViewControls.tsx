import { HStack, Icon, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { ActiveReader } from '../../types';
import Button from '../Button';
import useColorModeValue from '../hooks/useColorModeValue';
import HtmlFontSizeControls from '../HtmlFontSizeControls';
import { FitHeightWidth, Rotate } from '../icons';
import PdfZoomControls from '../PdfZoomControls';

interface ViewControlsProps {
  reader: ActiveReader;
  fitMode: 'width' | 'height';
}

const ViewControls: React.FC<ViewControlsProps> = ({ reader, fitMode }) => {
  const { type, navigator, state: readerState } = reader;

  const iconFill = useColorModeValue(
    'ui.gray.icon',
    'ui.white',
    'ui.gray.icon'
  );

  const toggleFitMode = () => {
    navigator.setFitMode(fitMode === 'width' ? 'height' : 'width');
  };

  return (
    <HStack spacing={2}>
      {type === 'PDF' && <PdfZoomControls navigator={navigator} />}
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
            onClick={navigator.rotateCounterClockwise}
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
