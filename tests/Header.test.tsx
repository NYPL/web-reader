import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../src/ui/Header';
import { MockHtmlReaderProps } from './utils/MockData';

import { axe } from 'jest-axe';

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
      screen.getByRole('link', { name: 'Return to Homepage' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Return to Homepage' })
    ).toHaveAttribute('href', '/');

    expect(
      screen.getByRole('button', { name: 'Settings' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Toggle full screen' })
    ).toBeInTheDocument();
  });
});
