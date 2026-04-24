import { Flex, useRadioGroup, UseRadioGroupProps } from '@chakra-ui/react';
import React from 'react';

type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof Flex> &
  Omit<UseRadioGroupProps, 'value' | 'defaultValue'> & {
    value: string;
    label: string;
  };

const ToggleGroup: React.FC<ToggleGroupProps> = (
  props: React.PropsWithoutRef<ToggleGroupProps>
) => {
  const { value, label, name, children, onChange, ...rest } = props;
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    onChange,
    value,
  });

  const group = getRootProps();

  return (
    <Flex aria-label={label} flexWrap="nowrap" gap={4} {...rest} {...group}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {React.Children.map(children, (element: any) => {
        try {
          const value = element.props.value;
          const radio = getRadioProps({ value });
          return React.cloneElement(element, {
            ...radio,
          });
        } catch (e) {
          throw new Error(
            'ToggleGroup expects ToggleButton children with `value` props.'
          );
        }
      })}
    </Flex>
  );
};

export default ToggleGroup;
