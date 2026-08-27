import { HStack, Icon, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { ActiveReader } from '../../types';
import Button from '../Button';
import { ToggleFullScreen, ToggleFullScreenExit } from '../icons';
import SettingsCard from '../SettingsButton';
import TableOfContent from '../TableOfContent';

interface DocActionsProps {
  reader: ActiveReader;
  containerRef: React.MutableRefObject<null | HTMLDivElement>;
  isFullScreen: boolean;
  handleFullscreen: () => void;
  mainBgColor: string;
}
const DocActions: React.FC<DocActionsProps> = ({
  reader,
  containerRef,
  isFullScreen,
  handleFullscreen,
  mainBgColor,
}) => {
  const { type, navigator, manifest } = reader;
  return (
    <HStack spacing={2}>
      <TableOfContent
        containerRef={containerRef}
        navigator={navigator}
        manifest={manifest}
      />
      <Tooltip
        content={
          isFullScreen ? 'Exit full screen mode' : 'Enter full screen mode'
        }
      >
        <Button
          aria-expanded={isFullScreen}
          aria-label={
            isFullScreen ? 'Exit full screen mode' : 'Enter full screen mode'
          }
          border="none"
          bgColor={mainBgColor}
          onClick={handleFullscreen}
          isIcon
        >
          <Icon
            as={isFullScreen ? ToggleFullScreenExit : ToggleFullScreen}
            w={18}
            h={18}
          />
        </Button>
      </Tooltip>
      {type === 'HTML' && <SettingsCard {...reader} />}
    </HStack>
  );
};

export default DocActions;
