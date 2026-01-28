import React, { ReactElement } from 'react';
import { Icon } from '@chakra-ui/react';

type FitHeightWidthProps = React.ComponentPropsWithoutRef<typeof Icon> & {
  fitWidth?: boolean;
};

const FitHeightWidth = ({
  fitWidth = false,
  ...props
}: FitHeightWidthProps): ReactElement => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 18"
    style={fitWidth ? { transform: 'rotate(90deg)' } : undefined}
    {...props}
  >
    <path
      d="M5.25 11.25L9 15L12.75 11.25M5.25 6.75L9 3L12.75 6.75"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default FitHeightWidth;
