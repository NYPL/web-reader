import { Icon } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

const Day = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_12320_966)">
      <path
        d="M9 1.5V3M9 15V16.5M3 9H1.5M4.73559 4.73559L3.67493 3.67493M13.2644 4.73559L14.3251 3.67493M4.73559 13.2675L3.67493 14.3282M13.2644 13.2675L14.3251 14.3282M16.5 9H15M12.75 9C12.75 11.0711 11.0711 12.75 9 12.75C6.92893 12.75 5.25 11.0711 5.25 9C5.25 6.92893 6.92893 5.25 9 5.25C11.0711 5.25 12.75 6.92893 12.75 9Z"
        stroke="#2E2E2E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_12320_966">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </Icon>
);

export default Day;
