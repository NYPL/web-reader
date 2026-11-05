import { HStack, Icon, Input, Text } from '@chakra-ui/react';
import React from 'react';
import { ActiveReader, WebReaderUiEvent } from '../../types';
import Button from '../Button';
import { PageDown, PageUp } from '../icons';
import Tooltip from '../Tooltip';

interface PageNavigationProps {
  navigator: ActiveReader['navigator'];
  isAtStart?: boolean;
  isAtEnd?: boolean;
  inputValue: string | number;
  totalPages: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTrackEvent?: (event: WebReaderUiEvent) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  navigator,
  isAtStart,
  isAtEnd,
  inputValue,
  totalPages,
  onInputChange,
  onInputKeyDown,
  onTrackEvent,
}) => {
  const handlePrevious = () => {
    navigator.goBackward();
    onTrackEvent?.({ uiText: 'Previous page', uiState: 'previous page' });
  };

  const handleNext = () => {
    navigator.goForward();
    onTrackEvent?.({ uiText: 'Next page', uiState: 'next page' });
  };

  return (
    <HStack spacing={2}>
      <Tooltip content="Previous page">
        <Button
          onClick={handlePrevious}
          aria-label="Previous page"
          isDisabled={isAtStart}
          isIcon
        >
          <Icon as={PageUp} w={18} h={18} />
        </Button>
      </Tooltip>
      <HStack color="ui.white" spacing={2} fontSize="sm" alignItems="center">
        <Input
          aria-label="Current page number"
          width="2rem"
          height="2rem"
          padding={0}
          bg="ui.gray.x-dark"
          border="none"
          textAlign="center"
          borderRadius="4px"
          _focus={{ outline: 'none', boxShadow: 'none' }}
          min="1"
          max={totalPages}
          type="number"
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
        />
        <Text>/</Text>
        <Text>{totalPages}</Text>
      </HStack>
      <Tooltip content="Next page">
        <Button
          onClick={handleNext}
          aria-label="Next page"
          isDisabled={isAtEnd}
          isIcon
        >
          <Icon as={PageDown} w={18} h={18} />
        </Button>
      </Tooltip>
    </HStack>
  );
};

export default PageNavigation;
