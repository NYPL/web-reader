import { Flex, ThemeProvider } from '@chakra-ui/react';
import * as React from 'react';
import { ActiveReader, ReaderReturn } from '../types';
import useColorModeValue from './hooks/useColorModeValue';
import { getTheme } from './theme';
import Toolbar from './toolbar/Toolbar';

/**
 * The default Manager UI. This will be broken into individual components
 * that can be imported and used separately or in a customized setup.
 * It takes the return value of useWebReader as props
 */
const ManagerUI: React.FC<ReaderReturn> = (props) => {
  return (
    <ThemeProvider theme={getTheme(props.state?.settings?.colorMode)}>
      <WebReaderContent {...props} />
    </ThemeProvider>
  );
};

const WebReaderContent: React.FC<ReaderReturn> = ({ children, ...props }) => {
  const bgColor = useColorModeValue('ui.white', 'ui.black', 'ui.sepia');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Keep the last known active props so the Header stays mounted during
  // chapter-boundary loading transitions, preserving focus on nav buttons.
  const lastActiveProps = React.useRef<ActiveReader | null>(null);
  if (props && !props.isLoading) {
    lastActiveProps.current = props as ActiveReader;
  }

  return (
    <Flex flexDir="column" w="100%" h="100%" position="relative">
      {lastActiveProps.current && (
        <Toolbar containerRef={containerRef} {...lastActiveProps.current} />
      )}

      <Flex
        ref={containerRef}
        position="relative"
        bg={bgColor}
        flexDir="column"
        alignItems="stretch"
        flex="1 1 auto"
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default ManagerUI;
