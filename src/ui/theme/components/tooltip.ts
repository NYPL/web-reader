import { defineStyleConfig } from '@chakra-ui/react';
import { defineStyle } from '@chakra-ui/system';
import { cssVar } from '@chakra-ui/theme-tools';

const $bg = cssVar('tooltip-bg');

const Tooltip = defineStyleConfig({
  baseStyle: defineStyle({
    [$bg.variable]: 'colors.ui.gray.xx-dark',
    borderRadius: '4px',
    boxShadow: 'none',
    color: 'ui.typography.inverse.heading',
    fontSize: 'desktop.caption',
    marginBottom: 1,
    maxWidth: '240px',
    marginTop: '0px',
    px: 2,
    py: 1,
    _dark: {
      [$bg.variable]: 'ui.gray.x-dark',
      color: 'dark.ui.typography.heading',
    },
  }),
});

export default Tooltip;
