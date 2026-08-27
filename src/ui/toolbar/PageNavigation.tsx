import { HStack, Icon, Input, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { ActiveReader } from '../../types';
import Button from '../Button';
import { PageDown, PageUp } from '../icons';

interface PageNavigationProps {
  navigator: ActiveReader['navigator'];
  isAtStart?: boolean;
  isAtEnd?: boolean;
  inputValue: string | number;
  totalPages: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  navigator,
  isAtStart,
  isAtEnd,
  inputValue,
  totalPages,
  onInputChange,
  onInputKeyDown,
}) => {
  return (
    <HStack spacing={2}>
      <Tooltip content="Previous page">
        <Button
          onClick={navigator.goBackward}
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
          onClick={navigator.goForward}
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
