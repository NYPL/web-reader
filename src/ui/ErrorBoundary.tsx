import { Flex, ThemeProvider } from '@chakra-ui/react';
import * as React from 'react';
import { WebReaderProps } from '..';
import ReaderErrorAlert from './ReaderErrorAlert';
import { getTheme } from './theme';
import { ToolbarWrapper } from './toolbar/Toolbar';

type ErrorState = { error?: Error; info?: React.ErrorInfo };
const initialState: ErrorState = { error: undefined, info: undefined };

class ErrorBoundary extends React.Component<WebReaderProps, ErrorState> {
  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  state = initialState;

  handleClearError(): void {
    this.setState(initialState);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      info: errorInfo,
    });
  }

  render(): React.ReactNode {
    const { error, info } = this.state;

    if (error && info) {
      return (
        <ThemeProvider theme={getTheme('day')}>
          <ToolbarWrapper />
          <Flex m={3} justifyContent="center" mt="20%">
            <ReaderErrorAlert message={error.message} />
          </Flex>
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
