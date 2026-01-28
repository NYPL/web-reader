import React, { ReactElement } from 'react';
import { Icon } from '@chakra-ui/react';

const PageDown = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M4.5 6.75L9 11.25L13.5 6.75"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default PageDown;
