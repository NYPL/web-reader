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
  const rootRef = React.useRef<HTMLDivElement>(null);
  const toolbarWrapRef = React.useRef<HTMLDivElement>(null);

  // Keep the last known active props so the Header stays mounted during
  // chapter-boundary loading transitions, preserving focus on nav buttons.
  const lastActiveProps = React.useRef<ActiveReader | null>(null);
  if (props && !props.isLoading) {
    lastActiveProps.current = props as ActiveReader;
  }

  React.useEffect(() => {
    const toolbarEl = toolbarWrapRef.current;
    const rootEl = rootRef.current;
    if (!toolbarEl || !rootEl) return;

    const updateHeight = () => {
      rootEl.style.setProperty(
        '--wr-toolbar-height',
        `${toolbarEl.offsetHeight}px`
      );
    };
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(toolbarEl);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Flex ref={rootRef} flexDir="column" w="100%" h="100%" position="relative">
      {lastActiveProps.current && (
        <Flex ref={toolbarWrapRef} flexDir="column">
          <Toolbar containerRef={containerRef} {...lastActiveProps.current} />
        </Flex>
      )}

      <Flex
        ref={containerRef}
        position="relative"
        bg={bgColor}
        flexDir="column"
        alignItems="stretch"
        flex="1 1 auto"
        minH={0}
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default ManagerUI;
