import React, { ReactElement } from 'react';
import { Icon } from '@chakra-ui/react';

const TableOfContents = (
  props: React.ComponentProps<typeof Icon>
): ReactElement => (
  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M15.75 9L6.75 9M15.75 4.5L6.75 4.5M15.75 13.5L6.75 13.5M3.75 9C3.75 9.41421 3.41421 9.75 3 9.75C2.58579 9.75 2.25 9.41421 2.25 9C2.25 8.58579 2.58579 8.25 3 8.25C3.41421 8.25 3.75 8.58579 3.75 9ZM3.75 4.5C3.75 4.91421 3.41421 5.25 3 5.25C2.58579 5.25 2.25 4.91421 2.25 4.5C2.25 4.08579 2.58579 3.75 3 3.75C3.41421 3.75 3.75 4.08579 3.75 4.5ZM3.75 13.5C3.75 13.9142 3.41421 14.25 3 14.25C2.58579 14.25 2.25 13.9142 2.25 13.5C2.25 13.0858 2.58579 12.75 3 12.75C3.41421 12.75 3.75 13.0858 3.75 13.5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default TableOfContents;
