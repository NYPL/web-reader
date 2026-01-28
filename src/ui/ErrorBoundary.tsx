import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  ThemeProvider,
  Flex,
} from '@chakra-ui/react';
import * as React from 'react';
import { WebReaderProps } from '..';
import { HeaderWrapper } from './Header';
import { getTheme } from './theme';

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
          <HeaderWrapper />
          <Flex m={3} justifyContent="center" mt="20%">
            <Alert
              status="error"
              variant="top-accent"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              maxW="600px"
            >
              <AlertIcon />
              <AlertTitle as="h1">An error occurred</AlertTitle>
              <AlertDescription role="alert" aria-label={error.message}>
                {error.message}
              </AlertDescription>
            </Alert>
          </Flex>
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
