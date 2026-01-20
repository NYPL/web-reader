import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TableOfContent from '../src/ui/TableOfContent';
import { MockNavigator, MockWebpubManifest } from './utils/MockData';

import { axe } from 'jest-axe';

const TestTOC: React.FC<
  Omit<React.ComponentProps<typeof TableOfContent>, 'containerRef'>
> = (props) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  return (
    <div ref={ref}>
      <TableOfContent containerRef={ref} {...props} />
    </div>
  );
};

describe('Table of Content Accessibility checker', () => {
  test('TOC should have no violation', async () => {
    const { container } = render(
      <TestTOC navigator={MockNavigator} manifest={MockWebpubManifest} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Empty Table of Content', () => {
  test('Empty TOC should show the missing toc message to users', () => {
    const MissingTocManifest = {
      ...MockWebpubManifest,
      toc: [],
    };
    render(<TestTOC navigator={MockNavigator} manifest={MissingTocManifest} />);

    expect(
      screen.queryByText(/This publication does not have a Table of Contents/)
    ).toBeInTheDocument();
  });
});

describe('Table Of Content rendering', () => {
  beforeEach(() => {
    render(<TestTOC navigator={MockNavigator} manifest={MockWebpubManifest} />);
  });

  test('render Table Of Content', async () => {
    // The initial TOC component render should not show TOC popover on the screen.
    expect(screen.queryByText('Chapter 1')).not.toBeVisible();

    // We need to open the TOC element for TOC links to show up
    const toggleBtn = screen.getByRole('button', { name: 'Table of Contents' });
    fireEvent.click(toggleBtn);

    const tocLinkElm = await screen.findByRole('menuitem', {
      name: 'Chapter 1',
    });
    expect(tocLinkElm).toBeInTheDocument();
  });

  test('navigation should be called with the correct url', async () => {
    const toggleBtn = screen.getByRole('button', { name: 'Table of Contents' });
    fireEvent.click(toggleBtn);

    const chapterOneElm = await screen.findByRole('menuitem', {
      name: 'Chapter 1',
    });
    fireEvent.click(chapterOneElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith('chapter/one/url');
  });

  test('navigation should call chapter and subchapters separately if both are provided', async () => {
    const toggleBtn = screen.getByRole('button', { name: 'Table of Contents' });
    fireEvent.click(toggleBtn);

    const chapterThreeElm = await screen.findByRole('menuitem', {
      name: 'Chapter 3',
    });
    fireEvent.click(chapterThreeElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith('chapter/three/url');

    fireEvent.click(toggleBtn);

    const chapterThreeOneElm = await screen.findByRole('menuitem', {
      name: 'Chapter 3 part 1',
    });
    fireEvent.click(chapterThreeOneElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith(
      'chapter/three_one/url'
    );
  });

  test('navigation should use first subchapter as chapter link if nothing is provided', async () => {
    const toggleBtn = screen.getByRole('button', { name: 'Table of Contents' });
    fireEvent.click(toggleBtn);

    const chapterFourElm = await screen.findByRole('menuitem', {
      name: 'Chapter 4',
    });
    fireEvent.click(chapterFourElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith('chapter/four/one/url');

    fireEvent.click(toggleBtn);

    const chapterFourOneElm = await screen.findByRole('menuitem', {
      name: 'Chapter 4 part 1',
    });
    fireEvent.click(chapterFourOneElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith('chapter/four/one/url');
  });

  //Documentation of not-yet-implemented functionality
  test('navigation does not show recursive child links', async () => {
    const toggleBtn = screen.getByRole('button', { name: 'Table of Contents' });
    fireEvent.click(toggleBtn);

    const chapterFourElm = await screen.findByRole('menuitem', {
      name: 'Chapter 4 part 2',
    });
    fireEvent.click(chapterFourElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith('chapter/four/two/url');

    fireEvent.click(toggleBtn);

    const chapterFourThreeElm = await screen.findByRole('menuitem', {
      name: 'Chapter 4 part 3',
    });
    fireEvent.click(chapterFourThreeElm);
    expect(MockNavigator.goToPage).toHaveBeenCalledWith(
      'chapter/four/three/one/url'
    );

    expect(screen.queryByText('Chapter 4 part 2.1')).toBeNull();
    expect(screen.queryByText('Chapter 4 part 3.1')).toBeNull();
  });
});
