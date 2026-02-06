import React from 'react';
import { render } from '@testing-library/react';
import HtmlSettings from '../src/ui/HtmlSettings';
import {
  MockHtmlNavigator,
  MockHtmlReaderState,
  MockHtmlSettingsProps,
} from './utils/MockData';

import { axe } from 'jest-axe';
import SettingsCard from '../src/ui/SettingsButton';

describe('SettingsCard Accessibility checker', () => {
  test('SettingsCard should have no violation', async () => {
    const { container } = render(
      <SettingsCard
        navigator={MockHtmlNavigator}
        state={MockHtmlReaderState}
        type={'HTML'}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  }, 15000);
});

describe('Render settings for different media type', () => {
  test('HTML settings', () => {
    const { getByRole, queryByLabelText } = render(
      <HtmlSettings {...MockHtmlSettingsProps} />
    );

    // default buttons
    expect(getByRole('tab', { name: 'Default' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Serif' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Sans-serif' })).toBeInTheDocument();
    expect(getByRole('tab', { name: 'Dyslexia' })).toBeInTheDocument();

    expect(getByRole('button', { name: 'Decrease text' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Increase text' })).toBeInTheDocument();

    expect(getByRole('radio', { name: 'Day' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Sepia' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Night' })).toBeInTheDocument();

    // default checked buttons. Can't mock 'click' because it's controlled.
    expect(getByRole('tab', { name: 'Sans-serif' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(getByRole('radio', { name: 'Day' })).toBeChecked();

    expect(queryByLabelText('Zoom In')).toBeNull();
    expect(queryByLabelText('Zoom Out')).toBeNull();
  });
});
