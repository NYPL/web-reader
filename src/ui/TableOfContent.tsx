import { Box, Icon, Portal } from '@chakra-ui/react';
import React from 'react';
import { Navigator, WebpubManifest } from '../types';
import { ReadiumLink } from '../WebpubManifestTypes/ReadiumLink';
import Button from './Button';
import useColorModeValue from './hooks/useColorModeValue';
import { TableOfContents } from './icons';
import { Menu, MenuButton, MenuItem, MenuList } from './menu';
import Tooltip from './Tooltip';

export default function TableOfContent({
  navigator,
  manifest,
  containerRef,
}: {
  navigator: Navigator;
  manifest: WebpubManifest;
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
}): React.ReactElement {
  const tocLinkHandler = (href: string) => {
    navigator.goToPage(href);
  };
  const tocBgColor = useColorModeValue('ui.white', 'ui.black', 'ui.sepia');

  const getLinkHref = (link: ReadiumLink): string => {
    if (link.href) return link.href;
    if (!link.children) throw new Error('Manifest is not well formed');
    return getLinkHref(link.children[0]);
  };

  const mainBgColor = useColorModeValue(
    'ui.gray.xx-dark',
    'ui.black',
    'ui.sepia'
  );
  return (
    <Menu>
      <>
        <Tooltip content="Table of contents">
          <MenuButton
            as={Button}
            border="none"
            aria-label="Table of contents"
            bg={mainBgColor}
            me={0}
            isIcon
          >
            <Icon as={TableOfContents} w={18} h={18} />
          </MenuButton>
        </Tooltip>
        <Portal containerRef={containerRef}>
          <MenuList
            overflowY="auto"
            m="0"
            position="absolute"
            top="0"
            left="0"
            bg={tocBgColor}
            right="0"
            bottom="0"
            zIndex="overlay"
            border="none"
            borderRadius="0"
          >
            {manifest.toc && manifest.toc.length > 0 ? (
              manifest.toc.map((content: ReadiumLink) => (
                <Item
                  key={content.title}
                  aria-label={content.title}
                  onClick={() => tocLinkHandler(getLinkHref(content))}
                  html={content.title ?? ''}
                >
                  {content.children && (
                    <>
                      {content.children.map((subLink) => (
                        <Item
                          aria-label={subLink.title}
                          key={subLink.title}
                          onClick={() => tocLinkHandler(getLinkHref(subLink))}
                          pl={10}
                          html={subLink.title ?? ''}
                        ></Item>
                      ))}
                    </>
                  )}
                </Item>
              ))
            ) : (
              <MissingToc>
                This publication does not have a Table of Contents.
              </MissingToc>
            )}
          </MenuList>
        </Portal>
      </>
    </Menu>
  );
}

const MissingToc = ({
  children,
}: {
  children: string | React.ReactElement;
}) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      maxHeight="100vmin"
    >
      {children}
    </Box>
  );
};

const Item = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof MenuItem> & { html: string }
>(({ html, children, ...props }, ref) => {
  const bgColor = useColorModeValue('ui.white', 'ui.black', 'ui.sepia');
  const color = useColorModeValue('ui.black', 'ui.white', 'ui.black');
  const borderColor = useColorModeValue(
    'ui.gray.medium',
    'gray.500',
    'yellow.600'
  );

  const _hover = {
    textDecoration: 'none',
    background: 'ui.gray.x-dark',
    color: 'ui.white',
  } as const;

  const _focus = {
    ..._hover,
    boxShadow: 'none',
  } as const;

  return (
    <>
      <MenuItem
        display="flex"
        flexDir="column"
        alignItems="stretch"
        listStyleType="none"
        bg={bgColor}
        color={color}
        _hover={_hover}
        _focus={_focus}
        tabIndex={-1}
        borderBottom="1px solid"
        borderColor={borderColor}
        {...props}
      >
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </MenuItem>
      {children}
    </>
  );
});
