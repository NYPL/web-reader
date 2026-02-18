import { Icon } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

const PageUp = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 18"
    fill="none"
    {...props}
  >
    <path
      d="M13.5 11.25L9 6.75L4.5 11.25"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default PageUp;
