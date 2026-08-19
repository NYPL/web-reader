import { render, screen } from '@testing-library/react';
import * as React from 'react';
import Header from '../src/ui/Header';
import { MockHtmlReaderProps } from './utils/MockData';

import { axe } from 'jest-axe';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('Header Accessibility checker', () => {
  test('header component should have no violation', async () => {
    const containerRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Header {...MockHtmlReaderProps} containerRef={containerRef} />
    );

    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});

describe('Header rendering', () => {
  test('render header bar', () => {
    const containerRef = React.createRef<HTMLDivElement>();
    render(<Header {...MockHtmlReaderProps} containerRef={containerRef} />);

    expect(
      screen.getByRole('button', { name: 'Settings' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Enter full screen mode' })
    ).toBeInTheDocument();
  });
});
