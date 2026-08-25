import { render, screen } from '@testing-library/react';
import * as React from 'react';
import Toolbar from '../src/ui/toolbar/Toolbar';
import { MockHtmlReaderProps } from './utils/MockData';

import { axe } from 'jest-axe';

describe('Toolbar Accessibility checker', () => {
  test('toolbar component should have no violation', async () => {
    const containerRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Toolbar {...MockHtmlReaderProps} containerRef={containerRef} />
    );

    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});

describe('Toolbar rendering', () => {
  test('render toolbar bar', () => {
    const containerRef = React.createRef<HTMLDivElement>();
    render(<Toolbar {...MockHtmlReaderProps} containerRef={containerRef} />);

    expect(
      screen.getByRole('button', { name: 'Settings' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Enter full screen mode' })
    ).toBeInTheDocument();
  });
});
