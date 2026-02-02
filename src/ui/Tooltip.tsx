import {
  BoxProps,
  chakra,
  ChakraComponent,
  Tooltip as ChakraTooltip,
  useStyleConfig,
} from '@chakra-ui/react';
import React, { forwardRef } from 'react';

export interface TooltipProps extends Omit<BoxProps, 'content'> {
  content: string | number | React.ReactNode;
}

export const Tooltip: ChakraComponent<
  React.ForwardRefExoticComponent<
    React.PropsWithChildren<TooltipProps> & React.RefAttributes<HTMLDivElement>
  >,
  React.PropsWithChildren<TooltipProps>
> = chakra(
  forwardRef<HTMLDivElement, React.PropsWithChildren<TooltipProps>>(
    (props, ref?) => {
      const { children, content, id, ...rest } = props;
      const styles = useStyleConfig('Tooltip', {});

      return (
        <ChakraTooltip
          aria-label={typeof content !== 'string' ? 'Tooltip' : undefined}
          closeDelay={750}
          closeOnClick
          closeOnEsc
          closeOnPointerDown
          hasArrow
          id={id}
          label={content}
          openDelay={500}
          offset={[0, 8]}
          placement="top"
          ref={ref}
          sx={styles}
          {...rest}
        >
          {children}
        </ChakraTooltip>
      );
    }
  )
);

export default Tooltip;
