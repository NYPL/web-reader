import { Icon } from '@chakra-ui/react';
import React, { ReactElement } from 'react';

const Reset = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 18 18"
    fill="none"
    {...props}
  >
    <path
      d="M1.5 7.5C1.5 7.5 3.00374 5.45116 4.22538 4.22868C5.44702 3.0062 7.1352 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C5.92268 15.75 3.32633 13.6907 2.51382 10.875M1.5 7.5V3M1.5 7.5H6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default Reset;
