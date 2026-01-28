import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import useColorModeValue from './hooks/useColorModeValue';

export type ButtonProps = React.ComponentPropsWithRef<typeof ChakraButton>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const mainBgColor = useColorModeValue(
      'ui.gray.xx-dark',
      'ui.black',
      'ui.sepia'
    );

    return (
      <ChakraButton
        h={8}
        w={8}
        p={1}
        borderRadius={4}
        bgColor={mainBgColor}
        _active={{ bgColor: 'ui.gray.x-dark' }}
        _hover={{ bgColor: 'ui.gray.x-dark' }}
        _focus={{
          bgColor: 'ui.gray.x-dark',
          ring: '2px',
          ringInset: 'inset',
        }}
        ref={ref}
        variant="solid"
        {...props}
      />
    );
  }
);

export default Button;
