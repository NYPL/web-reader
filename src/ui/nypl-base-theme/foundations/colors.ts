import { Colors } from '@chakra-ui/react';

const colors: Colors = {
  transparent: 'transparent',

  // ui fills
  ui: {
    black: '#000',
    white: '#fff',
    focus: '#4181F1',
    link: {
      primary: '#0576D3',
      secondary: '#004B98',
    },
    success: {
      primary: '#077719',
      secondary: '#095212',
    },
    warning: {
      primary: '#F0974E',
      secondary: '#EC7B1F',
    },
    status: {
      primary: '#F9E08E',
      secondary: '#FBE7E1',
    },
    error: '#97272C',
    disabled: {
      primary: '#E0E0E0',
      secondary: '#FAFAFA',
    },
    test: '#FF6347',
    gray: {
      active: '#D9D9D9',
      disabled: '#979797',
      icon: '#1C1B1F',
      medium: '#BDBDBD',
      dark: '#616161',
      'xxx-dark': '#252525',
      'xx-dark': '#2E2E2E',
      'x-dark': '#424242',
      'semi-dark': '#8D8D8D',
      'light-cool': '#E9E9E9',
      'light-warm': '#EFEDEB',
      'x-light-cool': '#F5F5F5',
      'x-light-warm': '#F8F8F7',
      'xx-light-cool': '#FAFAFA',
    },
    typography: {
      body: '#2E2E2E',
      heading: '#000',
      inverse: {
        heading: '#E9E9E9',
      },
    },
  },
  dark: {
    ui: {
      typography: {
        heading: '#E9E9E9',
      },
      border: {
        default: '#8D8D8D',
      },
      bg: {
        hover: '#2E2E2E',
        active: '#616161',
        page: '#191919',
      },
    },
  },

  // brand fills. Only primary and secondary filled in for now.
  brand: {
    primary: '#C60917',
    secondary: '#760000',
    'nypl-red': '#D0343A',
  },

  section: {
    research: {
      secondary: '#006166',
    },
  },

  /**
   * The following color scales are useful for color edge cases
   * where a distinct named ui or brand color doesn't quite work.
   */
  // based on ui/gray/medium
  gray: {
    '50': '#F2F2F2',
    '100': '#DBDBDB',
    '200': '#C4C4C4',
    '300': '#ADADAD',
    '400': '#969696',
    '500': '#808080',
    '600': '#666666',
    '700': '#4D4D4D',
    '800': '#333333',
    '900': '#1A1A1A',
  },
  // based on NYPL red
  red: {
    50: '#ffe7e6',
    100: '#f6c2bf',
    200: '#e99796',
    300: '#de6d6e',
    400: '#d4454a',
    500: '#ba2f2b',
    600: '#922b21',
    700: '#692216',
    800: '#41150a',
    900: '#1d0a01',
  },
  // based on ui/warning/secondary
  orange: {
    '50': '#FDF1E7',
    '100': '#F9D8BD',
    '200': '#F6BF93',
    '300': '#F2A669',
    '400': '#EF8D3E',
    '500': '#EB7414',
    '600': '#BC5D10',
    '700': '#8D460C',
    '800': '#5E2F08',
    '900': '#2F1704',
  },
  // based on ui/status/primary
  yellow: {
    '50': '#FEF8E7',
    '100': '#FBECBB',
    '200': '#F9E090',
    '300': '#F7D464',
    '400': '#F4C938',
    '500': '#F2BD0D',
    '600': '#C2970A',
    '700': '#917108',
    '800': '#614B05',
    '900': '#302603',
  },
  // based on ui/success/primary
  green: {
    '50': '#E7FEEB',
    '100': '#BCFBC6',
    '200': '#90F8A1',
    '300': '#65F67C',
    '400': '#3AF357',
    '500': '#0EF133',
    '600': '#0BC128',
    '700': '#08911E',
    '800': '#066014',
    '900': '#03300A',
  },
  // based on NYPL blue
  blue: {
    50: '#dbefff',
    100: '#add2ff',
    200: '#7cb8ff',
    300: '#4aa2ff',
    400: '#1a8fff',
    500: '#007ee6',
    600: '#0056b4',
    700: '#003582',
    800: '#001a51',
    900: '#000621',
  },
};

export default colors;
