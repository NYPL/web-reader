import { Button as ChakraButton } from '@chakra-ui/react';
import React from 'react';
import useColorModeValue from './hooks/useColorModeValue';

export type ButtonProps = React.ComponentPropsWithRef<typeof ChakraButton> & {
  isIcon?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ isIcon, ...props }, ref) => {
    const mainBgColor = useColorModeValue(
      'ui.gray.xx-dark',
      'ui.black',
      'ui.sepia'
    );

    const iconProps = isIcon
      ? {
          borderRadius: 4,
          bgColor: mainBgColor,
          _active: { bgColor: 'ui.gray.x-dark' },
          _hover: { bgColor: 'ui.gray.x-dark' },
          _focus: {
            bgColor: 'ui.gray.x-dark',
            ring: '2px',
            ringInset: 'inset',
          },
          padding: 1,
          height: '2rem',
          width: '2rem',
        }
      : {};

    return <ChakraButton ref={ref} variant="solid" {...iconProps} {...props} />;
  }
);

export default Button;
