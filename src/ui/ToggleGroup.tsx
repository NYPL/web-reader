import { Flex, useRadioGroup, UseRadioGroupProps } from '@chakra-ui/react';
import React from 'react';

type ToggleGroupProps = Omit<UseRadioGroupProps, 'value' | 'defaultValue'> & {
  value: string;
  label: string;
};

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  label,
  name,
  children,
  onChange,
}) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name,
    onChange,
    value,
  });

  const group = getRootProps();

  return (
    <Flex {...group} aria-label={label} flexWrap="nowrap">
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
