import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import Toolbar from '../src/ui/toolbar/Toolbar';
import {
  MockHtmlReaderProps,
  MockHtmlReaderState,
  MockPdfReaderProps,
} from './utils/MockData';

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

describe('Toolbar onTrackEvent', () => {
  const totalPages = 5;
  const currentPage = 2;

  test('fires onTrackEvent for zoom in and zoom out', () => {
    const onTrackEvent = jest.fn();
    const containerRef = React.createRef<HTMLDivElement>();
    render(
      <Toolbar
        {...MockPdfReaderProps}
        containerRef={containerRef}
        totalPages={totalPages}
        currentPage={currentPage}
        onTrackEvent={onTrackEvent}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Zoom in',
      uiState: 'zoom in',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Zoom out',
      uiState: 'zoom out',
    });
  });

  test('fires onTrackEvent with fit to width/height', () => {
    const onTrackEvent = jest.fn();

    const { rerender } = render(
      <Toolbar
        {...MockHtmlReaderProps}
        containerRef={React.createRef<HTMLDivElement>()}
        totalPages={totalPages}
        currentPage={currentPage}
        onTrackEvent={onTrackEvent}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fit to width' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Fit to width',
      uiState: 'fit to width',
    });

    rerender(
      <Toolbar
        {...MockHtmlReaderProps}
        state={{ ...MockHtmlReaderProps.state, fitMode: 'width' }}
        containerRef={React.createRef<HTMLDivElement>()}
        totalPages={totalPages}
        currentPage={currentPage}
        onTrackEvent={onTrackEvent}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fit to height' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Fit to height',
      uiState: 'fit to height',
    });
  });

  test('fires onTrackEvent when rotating left', () => {
    const onTrackEvent = jest.fn();
    const containerRef = React.createRef<HTMLDivElement>();
    render(
      <Toolbar
        {...MockPdfReaderProps}
        containerRef={containerRef}
        totalPages={totalPages}
        currentPage={currentPage}
        onTrackEvent={onTrackEvent}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rotate left' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Rotate left',
      uiState: 'rotate left',
    });
  });

  test('fires onTrackEvent for previous and next page navigation', () => {
    const onTrackEvent = jest.fn();
    const containerRef = React.createRef<HTMLDivElement>();
    render(
      <Toolbar
        {...MockHtmlReaderProps}
        state={{ ...MockHtmlReaderState, atStart: false, atEnd: false }}
        containerRef={containerRef}
        totalPages={totalPages}
        currentPage={currentPage}
        onTrackEvent={onTrackEvent}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Previous page',
      uiState: 'previous page',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onTrackEvent).toHaveBeenCalledWith({
      uiText: 'Next page',
      uiState: 'next page',
    });
  });

  test('fires onTrackEvent when opening and closing full screen', () => {
    const onTrackEvent = jest.fn();
    const toggleFullScreen = jest.fn();
    const containerRef = React.createRef<HTMLDivElement>();
    render(
      <Toolbar
        {...MockHtmlReaderProps}
        containerRef={containerRef}
        totalPages={totalPages}
        currentPage={currentPage}
        toggleFullScreen={toggleFullScreen}
        onTrackEvent={onTrackEvent}
      />
    );

    const enterButton = screen.getByRole('button', {
      name: 'Enter full screen mode',
    });
    fireEvent.click(enterButton);
    expect(onTrackEvent).toHaveBeenLastCalledWith({
      uiText: 'Enter full screen mode',
      uiState: 'opened',
    });

    const exitButton = screen.getByRole('button', {
      name: 'Exit full screen mode',
    });
    fireEvent.click(exitButton);
    expect(onTrackEvent).toHaveBeenLastCalledWith({
      uiText: 'Enter full screen mode',
      uiState: 'closed',
    });
  });
});
