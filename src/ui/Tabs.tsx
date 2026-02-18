import {
  Tabs as ChakraTabs,
  Tab,
  TabList,
  ThemeProvider,
  useMultiStyleConfig,
  useTheme,
} from '@chakra-ui/react';
import React from 'react';
import { getTheme } from './theme';
import Fonts from './theme/foundations/fonts';

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    fontFamily?: string;
    fontWeight?: string | number;
  }[];
  children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ value, onChange, options, children }) => {
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const styles = useMultiStyleConfig('Tabs');
  const theme = useTheme();

  return (
    <ThemeProvider theme={getTheme(theme.currentColorMode)}>
      <Fonts />
      <ChakraTabs
        index={selectedIndex}
        onChange={(idx) => onChange(options[idx].value)}
        sx={styles.root}
        variant="custom"
        isFitted
      >
        <TabList sx={styles.tablist}>
          {options.map((opt) => (
            <Tab
              key={opt.value}
              sx={styles.tab}
              fontFamily={opt.fontFamily}
              fontWeight={opt.fontWeight}
            >
              {opt.icon}
              {opt.label}
            </Tab>
          ))}
        </TabList>
        {children}
      </ChakraTabs>
    </ThemeProvider>
  );
};

export default Tabs;
