import {
  Box,
  Icon,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react';
import * as React from 'react';
import { HTMLActiveReader, PDFActiveReader } from '../types';

import Button from './Button';
import useColorModeValue from './hooks/useColorModeValue';
import HtmlSettings from './HtmlSettings';
import { ReaderSettings } from './icons';
import Tooltip from './Tooltip';

type SettingsCardProps =
  | Pick<PDFActiveReader, 'navigator' | 'state' | 'type'>
  | Pick<HTMLActiveReader, 'navigator' | 'state' | 'type'>;

export default function SettingsCard(
  props: SettingsCardProps
): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const contentBgColor = useColorModeValue('ui.white', 'ui.black', 'ui.white');
  const iconFill = useColorModeValue(
    'ui.gray.icon',
    'ui.white',
    'ui.gray.icon'
  );
  const paginationValue = props.state?.settings?.isScrolling
    ? 'scrolling'
    : 'paginated';

  const mainBgColor = useColorModeValue(
    'ui.gray.xx-dark',
    'ui.black',
    'ui.sepia'
  );

  return (
    <>
      <Popover
        gutter={0}
        closeOnBlur
        placement="bottom-start"
        isOpen={isOpen}
        onClose={close}
        onOpen={open}
        autoFocus={true}
        preventOverflow
        strategy="fixed"
      >
        <Tooltip content="Settings">
          <Box display="inline-block">
            <PopoverTrigger>
              <Button
                aria-label="Settings"
                onClick={open}
                /**
                 * preventDefault fixes a Chakra bug where in Safari,
                 * the PopoverTrigger will not close the Popover.
                 * The issue is described in
                 * https://github.com/chakra-ui/chakra-ui/issues/3461
                 * and the workaround can be found in
                 * https://github.com/chakra-ui/chakra-ui/issues/587.
                 * */
                onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
                  e.preventDefault()
                }
                bg={mainBgColor}
                border="none"
                gap={[0, 0, 2]}
                isIcon
              >
                <Icon as={ReaderSettings} w={18} h={18} />
              </Button>
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent
          overflow="hidden"
          bgColor={contentBgColor}
          borderColor="ui.gray.disabled"
          borderRadius="0 0 2px 2px"
          filter="drop-shadow(0 1px 2px #00000040)"
          width={['90vw', '90vw', 'inherit']}
          marginRight={[4, 4, 4, 0]}
          maxWidth="100vw"
          padding={1}
          aria-label="Settings dialog"
        >
          <PopoverBody p={0}>
            {props.type === 'HTML' && (
              <HtmlSettings
                navigator={props.navigator}
                iconFill={iconFill}
                readerState={props.state}
                paginationValue={paginationValue}
              />
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}
