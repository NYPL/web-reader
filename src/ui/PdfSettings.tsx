import { ButtonGroup, Icon } from '@chakra-ui/react';
import * as React from 'react';
import { MdOutlineZoomIn, MdOutlineZoomOut } from 'react-icons/md';
import { PdfNavigator, ReaderState } from '../types';
import Button from './Button';
import { Continuous, Paginated } from './icons';
import ToggleButton from './ToggleButton';
import ToggleGroup from './ToggleGroup';

export type PdfSettingsProps = {
  navigator: PdfNavigator;
  readerState: ReaderState;
  paginationValue: string;
};

export default function PdfSettings(
  props: PdfSettingsProps
): React.ReactElement {
  const { navigator, paginationValue } = props;
  const { zoomOut, zoomIn, setScroll } = navigator;

  const iconFill = 'ui.gray.icon';

  return (
    <>
      <ButtonGroup display="flex" spacing={0}>
        <Button
          flexGrow={1}
          aria-label="Zoom Out"
          onClick={zoomOut}
          variant="settings"
        >
          <Icon as={MdOutlineZoomOut} w={7} h={7} pl={1} />
          Zoom Out
        </Button>
        <Button
          flexGrow={1}
          aria-label="Zoom In"
          onClick={zoomIn}
          variant="settings"
        >
          <Icon as={MdOutlineZoomIn} w={7} h={7} pl={1} />
          Zoom In
        </Button>
      </ButtonGroup>
      <ToggleGroup
        onChange={setScroll}
        value={paginationValue}
        label="pagination options"
      >
        <ToggleButton
          value="paginated"
          borderRadius="0 0 0 4px"
          label="Paginated"
          icon={Paginated}
          iconFill={iconFill}
        />
        <ToggleButton
          value="scrolling"
          borderRadius="0 0 4px 0"
          label="Scrolling"
          icon={Continuous}
          iconFill={iconFill}
        />
      </ToggleGroup>
    </>
  );
}
