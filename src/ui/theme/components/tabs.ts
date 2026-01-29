import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';
import { GetColor } from '../../../types';

const {
  defineMultiStyleConfig,
  definePartsStyle,
} = createMultiStyleConfigHelpers(['root', 'tab', 'tablist']);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getTabsStyle = (getColor: GetColor) =>
  defineMultiStyleConfig({
    variants: {
      custom: definePartsStyle({
        root: {},
        tablist: {
          borderColor: getColor(
            'ui.black',
            'dark.ui.border.default',
            'ui.sepia'
          ),
          width: '100%',
        },
        tab: {
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
          _selected: {
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
          },
        },
      }),
    },
    defaultProps: {
      variant: 'custom',
    },
  });

export default getTabsStyle;
