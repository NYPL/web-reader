import {
  Box as ChakraBox,
  Icon,
  Text,
  ThemeProvider,
  useRadio,
  useTheme,
} from '@chakra-ui/react';
import React, { ReactElement } from 'react';

import { ColorMode } from '../types';
import Button from './Button';
import { getTheme } from './theme';

export type ToggleButtonProps = React.ComponentPropsWithoutRef<
  typeof ChakraBox
> & {
  colorMode?: ColorMode;
  icon?: ReactElement;
  iconFill?: string;
  label?: string;
  value: string;
  isChecked: boolean;
};

function ToggleButton(
  props: React.PropsWithoutRef<ToggleButtonProps>
): React.ReactElement {
  const {
    children,
    colorMode,
    icon,
    iconFill,
    label,
    value,
    isChecked,
    ...rest
  } = props;
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const radio = getRadioProps();
  const theme = useTheme();

  return (
    // This will override the default theme if we specify the colorMode to the toggle button.
    <ThemeProvider theme={getTheme(colorMode ?? theme.currentColorMode)}>
      <ChakraBox as="label" display="flex" aria-label={label}>
        <input {...input} />
        <Button
          as="div"
          px={4}
          py={2}
          width="150px"
          height="40px"
          {...radio}
          {...rest}
        >
          {icon && (
            <Icon
              as={icon}
              verticalAlign="middle"
              mr={1.5}
              w={18}
              h={18}
              fill={iconFill && iconFill}
            />
          )}
          {label && <Text>{label}</Text>}
        </Button>
      </ChakraBox>
    </ThemeProvider>
  );
}

export const ColorModeToggleButton: typeof ToggleButton = ({
  bgColor,
  ...rest
}) => {
  return (
    <ToggleButton
      sx={{
        _checked: {
          bgColor,
          border: '2px solid',
          borderColor: 'section.research.secondary',
        },
      }}
      {...rest}
    />
  );
};

export default ToggleButton;
