import { Icon } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

const Night = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_12320_2180)">
      <path
        d="M16.4661 9.71746C15.4335 11.5289 13.4844 12.7502 11.25 12.7502C7.93629 12.7502 5.25 10.064 5.25 6.75025C5.25 4.51572 6.4715 2.56649 8.2832 1.53387C4.47731 1.89473 1.5 5.09971 1.5 9.00007C1.5 13.1422 4.85786 16.5001 9 16.5001C12.9002 16.5001 16.105 13.5231 16.4661 9.71746Z"
        stroke="#BDBDBD"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_12320_2180">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </Icon>
);

export default Night;
