import { Icon } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

const Reset = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 18"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_12529_2809)">
      <path
        d="M1.5 7.5C1.5 7.5 1.59099 6.86307 4.22703 4.22703C6.86307 1.59099 11.1369 1.59099 13.773 4.22703C14.7069 5.16099 15.31 6.30054 15.5821 7.5M1.5 7.5V3M1.5 7.5H6M16.5 10.5C16.5 10.5 16.409 11.1369 13.773 13.773C11.1369 16.409 6.86307 16.409 4.22703 13.773C3.29307 12.839 2.69002 11.6995 2.41787 10.5M16.5 10.5V15M16.5 10.5H12"
        stroke="#2E2E2E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_12529_2809">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </Icon>
);

export default Reset;
