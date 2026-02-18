import React, { ReactElement } from 'react';
import { Icon } from '@chakra-ui/react';

const ToggleFullScreen = (
  props: React.ComponentProps<typeof Icon>
): ReactElement => (
  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M10.5 7.5L15.75 2.25M15.75 2.25H11.25M15.75 2.25V6.75M7.5 10.5L2.25 15.75M2.25 15.75H6.75M2.25 15.75L2.25 11.25"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default ToggleFullScreen;
