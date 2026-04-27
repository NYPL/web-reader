import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';
import { GetColor } from '../../../types';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(['root', 'button']);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getFontFamilyToggleStyle = (getColor: GetColor) =>
  defineMultiStyleConfig({
    variants: {
      custom: definePartsStyle({
        button: {
          bg: getColor('ui.white', 'dark.ui.bg.page', 'ui.gray.light-cool'),
          border: '0',
          borderBottom: '1px solid',
          color: getColor(
            'ui.typography.heading',
            'dark.ui.typography.heading',
            'ui.typography.heading'
          ),
          flex: 1,
          height: { base: '44px' },
          paddingEnd: {
            base: 's',
            md: 'l',
            lg: 'xl',
          },
          paddingInlineStart: 's',
          paddingStart: 's',
          whiteSpace: 'nowrap',
          _hover: {
            bg: getColor(
              'ui.gray.x-light-cool',
              'dark.ui.bg.hover',
              'ui.gray.x-light-cool'
            ),
            borderTopRadius: '4px',
            borderBottomColor: getColor(
              'ui.black',
              'dark.ui.border.default',
              'ui.black'
            ),
          },
          _checked: {
            fontWeight: 'bold',
            bg: getColor(
              'ui.gray.light-cool',
              'dark.ui.bg.active',
              'ui.gray.light-cool'
            ),
            border: '0',
            borderTopRadius: '4px',
            borderBottom: '3px solid',
            borderBottomColor: getColor(
              'ui.black',
              'dark.ui.border.default',
              'ui.black'
            ),
            paddingBottom: '5px',
            color: getColor(
              'ui.typography.heading',
              'dark.ui.typography.heading',
              'ui.typography.heading'
            ),
          },
          _focus: {
            boxShadow: '0',
            zIndex: 1,
            position: 'relative',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'custom',
    },
  });

export default getFontFamilyToggleStyle;
