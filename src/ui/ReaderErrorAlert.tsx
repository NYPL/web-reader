import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import * as React from 'react';

interface ReaderErrorAlertProps {
  message: string;
  title?: string;
  maxW?: string;
}

const ReaderErrorAlert = ({
  message,
  title = 'An error occurred',
  maxW = '600px',
}: ReaderErrorAlertProps): React.ReactElement => {
  return (
    <Alert
      status="error"
      variant="top-accent"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      maxW={maxW}
    >
      <AlertIcon />
      <AlertTitle as="h1">{title}</AlertTitle>
      <AlertDescription role="alert" aria-label={message}>
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default ReaderErrorAlert;
