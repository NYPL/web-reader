import React, { ReactElement } from 'react';
import { Icon } from '@chakra-ui/react';

const ToggleFullScreenExit = (
  props: React.ComponentProps<typeof Icon>
): ReactElement => (
  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M3 10.5H7.5M7.5 10.5V15M7.5 10.5L2.25 15.75M15 7.5H10.5M10.5 7.5V3M10.5 7.5L15.75 2.25"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default ToggleFullScreenExit;
