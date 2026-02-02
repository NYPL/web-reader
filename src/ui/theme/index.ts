import { extendTheme } from '@chakra-ui/react';
import { ColorMode } from '../../types';
import { getColor } from '../../utils/getColor';
import nyplTheme from '../nypl-base-theme';
import Alert from './components/alert';
import getButtonStyle from './components/button';
import SkipNavigation from './components/skipNavigation';
import getTabsStyle from './components/tabs';
import Text from './components/text';
import Tooltip from './components/tooltip';
import colors from './foundations/colors';
import { Dict } from './types';

/**
 * See Chakra default theme for shape of theme object:
 * https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme
 *
 * Making this a function because we need to adjust the theme based
 * on the colorMode that's being passed in.
 *
 * Returns the chakra theme object with an additional property `currentColorMode`
 */
export function getTheme(colorMode: ColorMode = 'day'): Dict<unknown> {
  return extendTheme(
    {
      colors,
      /**
       * Chakra documentation on component styles:
       * https://chakra-ui.com/docs/theming/component-style
       */
      components: {
        Button: getButtonStyle(getColor(colorMode)),
        Text,
        Alert,
        SkipNavigation,
        Tabs: getTabsStyle(getColor(colorMode)),
        Tooltip,
      },
      currentColorMode: colorMode,
    },
    nyplTheme
  );
}
