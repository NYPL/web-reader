import { Flex, ThemeProvider } from '@chakra-ui/react';
import * as React from 'react';
import { ReaderReturn } from '../types';
import Header from './Header';
import useColorModeValue from './hooks/useColorModeValue';
import { getTheme } from './theme';

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

  return (
    <Flex flexDir="column" w="100%" position="relative">
      {!props.isLoading && <Header containerRef={containerRef} {...props} />}

      <Flex
        as="main"
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
