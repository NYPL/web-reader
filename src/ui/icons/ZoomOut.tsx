import React, { ReactElement } from 'react';
import { Icon } from '@chakra-ui/react';

const ZoomOut = (props: React.ComponentProps<typeof Icon>): ReactElement => (
  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" {...props}>
    <path
      d="M15.75 15.75L12.4875 12.4875M6 8.25H10.5M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default ZoomOut;
