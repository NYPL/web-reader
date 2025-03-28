import 'react-app-polyfill/ie11';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  useParams,
} from 'react-router-dom';
import WebReader from '../src';
import {
  ChakraProvider,
  Heading,
  UnorderedList,
  ListItem,
  Box,
  // Text,
  // Input,
  // Button,
  // Stack,
} from '@chakra-ui/react';
import { getTheme } from '../src/ui/theme';
import readiumBefore from 'url:../src/HtmlReader/ReadiumCss/ReadiumCSS-before.css';
import readiumDefault from 'url:../src/HtmlReader/ReadiumCss/ReadiumCSS-default.css';
import readiumAfter from 'url:../src/HtmlReader/ReadiumCss/ReadiumCSS-after.css';
import { Injectable } from '../src/Readium/Injectable';
import useSWR, { Fetcher } from 'swr';
// import Tests from './Tests';
// import UseHtmlReader from './use-html-reader';
// import mobyEpub2Manifest from './static/samples/moby-epub2-exploded/manifest.json';
// import pdfSingleResourceManifest from './static/samples/pdf/single-resource-short.json';
// import { WebpubManifest } from '../src/types';
// import UsePdfReader from './use-pdf-reader';

const origin = window.location.origin;

// const pdfProxyUrl = process.env.CORS_PROXY_URL as string | undefined;
// const pdfProxyUrl = undefined;
// const pdfWorkerSrc = `${origin}/pdf-worker/pdf.worker.min.mjs`;

const cssInjectables: Injectable[] = [
  {
    type: 'style',
    url: readiumBefore,
  },
  {
    type: 'style',
    url: readiumDefault,
  },
  {
    type: 'style',
    url: readiumAfter,
  },
];

const fontInjectable: Injectable[] = [
  {
    type: 'style',
    url: `${origin}/fonts/opendyslexic/opendyslexic.css`,
    fontFamily: 'opendyslexic',
  },
];

const scriptInjectable: Injectable[] = [
  {
    type: 'script',
    url: `${origin}/js/sample.js`,
  },
];

const htmlInjectablesReflowable = [
  ...cssInjectables,
  ...fontInjectable,
  ...scriptInjectable,
];

const App = () => {
  return (
    <ChakraProvider theme={getTheme('day')}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>

          <Route path="/pdf">
            <PdfReaders />
          </Route>
          {/* <Route path="/html">
            <HtmlReaders />
          </Route> */}

          <Route path="*">
            <h1>404</h1>
            <p>Page not found.</p>
          </Route>
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const PdfReaders = () => {
  return (
    <>
      <Route path={`/pdf/single-resource-short`}>
        <SingleResourcePdf />
      </Route>
      {/* <Route path={`/pdf/use-pdf-reader-hook`}>
        <UsePdfReader
          webpubManifestUrl="/samples/pdf/single-resource-short.json"
          manifest={pdfSingleResourceManifest as WebpubManifest}
          proxyUrl={pdfProxyUrl}
          pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
        />
      </Route>
      <Route path={`/pdf/large`}>
        <WebReader
          webpubManifestUrl="/samples/pdf/single-resource-long.json"
          proxyUrl={pdfProxyUrl}
          pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
        />
      </Route>
      <Route path={`/pdf/collection`}>
        <WebReader
          webpubManifestUrl="/samples/pdf/multi-resource.json"
          proxyUrl={pdfProxyUrl}
          pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
        />
      </Route>
      <Route path={`/pdf/fixed-height-embedded-collection`}>
        <Box bg="lavenderblush" p={6} w="100vw">
          <Heading>Fixed-height Embedded PDF</Heading>
          <Text as="p">
            This example shows how a web reader looks embedded within a page
            instead of taking over the full page. It is fixed height, which
            means it will not grow to fit content in scrolling mode.
          </Text>
          <WebReader
            webpubManifestUrl={`${origin}/samples/pdf/multi-resource.json`}
            proxyUrl={pdfProxyUrl}
            pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
            growWhenScrolling={false}
          />
          <Heading>The page continues...</Heading>
          <Text as="p">Here is some more content below the reader</Text>
        </Box>
      </Route>
      <Route path={`/pdf/growing-height-embedded-collection`}>
        <Box bg="lavenderblush" p={6} w="100vw">
          <Heading>Growing-height Embedded PDF</Heading>
          <Text as="p">
            This example shows how a web reader looks embedded within a page
            instead of taking over the full page. This example lets the PDF grow
            to fit content of the resource in scrolling mode. In paginated mode,
            however, it will use the value of the `height` prop.
          </Text>
          <WebReader
            webpubManifestUrl={`${origin}/samples/pdf/multi-resource.json`}
            proxyUrl={pdfProxyUrl}
            pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
          />
          <Heading>The page continues...</Heading>
          <Text as="p">Here is some more content below the reader</Text>
        </Box>
      </Route> */}
    </>
  );
};

/**
 * This is a function we will use to get the resource through a given proxy url.
 * It will eventually be passed to the web reader instead of passing a proxy url directly.
 */
// const getProxiedResource = (proxyUrl?: string) => async (href: string) => {
//   // Generate the resource URL using the proxy
//   const url: string = proxyUrl
//     ? `${proxyUrl}${encodeURIComponent(href)}`
//     : href;
//   const response = await fetch(url, { mode: 'cors' });
//   const array = new Uint8Array(await response.arrayBuffer());

//   if (!response.ok) {
//     throw new Error('Response not Ok for URL: ' + url);
//   }
//   return array;
// };

/**
 * - Fetches manifest
 * - Adds the TOC to the manifest
 * - Generates a syncthetic url for the manifest to be passed to
 * web reader.
 * - Returns the synthetic url
 */
const fetchAndModifyManifest: Fetcher<string, string> = async (url) => {
  const response = await fetch(url);
  const manifest = await response.json();
  // const modifiedManifest = await addTocToManifest(
  //   manifest,
  //   getProxiedResource(pdfProxyUrl),
  //   pdfWorkerSrc
  // );
  // const syntheticUrl = URL.createObjectURL(
  //   new Blob([JSON.stringify(modifiedManifest)])
  // );
  const syntheticUrl = URL.createObjectURL(
    new Blob([JSON.stringify(manifest)])
  );
  return syntheticUrl;
};

const SingleResourcePdf = () => {
  const { data: modifiedManifestUrl, isLoading } = useSWR<string>(
    '/samples/pdf/single-resource-short.json',
    fetchAndModifyManifest,
    {
      revalidateOnFocus: false,
    }
  );

  if (isLoading || !modifiedManifestUrl) return <div>Loading...</div>;

  return (
    <WebReader
      webpubManifestUrl={modifiedManifestUrl}
      pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
    />
  );
};

const HtmlReaders = () => {
  // return (
  //   <Switch>
  //     <Route path={`/html/moby-epub2`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl={`${origin}/samples/moby-epub2-exploded/manifest.json`}
  //       />
  //     </Route>
  //     <Route path={`/html/moby-epub3`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl={`${origin}/samples/moby-epub3-exploded/manifest.json`}
  //       />
  //     </Route>
  //     <Route path={`/html/moby-epub3-no-local-storage`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         persistLastLocation={false}
  //         persistSettings={false}
  //         webpubManifestUrl={`${origin}/samples/moby-epub3-exploded/manifest.json`}
  //       />
  //     </Route>
  //     <Route path={`/html/fixed-layout`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl={`${origin}/samples/fixed-layout/manifest.json`}
  //       />
  //     </Route>
  //     <Route path={`/html/fxl-poems`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl={`${origin}/samples/fxl-poems/manifest.json`}
  //       />
  //     </Route>
  //     <Route path={`/html/fixed-height-embedded-moby-epub2`}>
  //       <Box bg="lavenderblush" p={6} w="100vw">
  //         <Heading>Fixed-height Embedded Example</Heading>
  //         <Text as="p">
  //           This example shows how a web reader looks embedded within a page
  //           instead of taking over the full page. It is fixed height, which
  //           means it will not grow to fit content in scrolling mode.
  //         </Text>
  //         <WebReader
  //           injectablesReflowable={htmlInjectablesReflowable}
  //           webpubManifestUrl={`${origin}/samples/moby-epub2-exploded/manifest.json`}
  //           growWhenScrolling={false}
  //           height="70vh"
  //         />
  //         <Heading>The page continues...</Heading>
  //         <Text as="p">Here is some more content below the reader</Text>
  //       </Box>
  //     </Route>
  //     <Route path={`/html/growing-embedded-moby-epub2`}>
  //       <Box bg="lavenderblush" p={6} w="100vw">
  //         <Heading>Growing-height Embedded Example</Heading>
  //         <Text as="p">
  //           This example shows how a web reader looks embedded within a page and
  //           with a growing-height policy. This example lets the PDF grow to fit
  //           content of the resource in scrolling mode. In paginated mode,
  //           however, it will use the value of the `height` prop.
  //         </Text>
  //         <WebReader
  //           injectablesReflowable={htmlInjectablesReflowable}
  //           webpubManifestUrl={`${origin}/samples/moby-epub2-exploded/manifest.json`}
  //         />
  //         <Heading>The page continues...</Heading>
  //         <Text as="p">Here is some more content below the reader</Text>
  //       </Box>
  //     </Route>
  //     <Route path={`/html/streamed-alice-epub`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl="https://alice.dita.digital/manifest.json"
  //       />
  //     </Route>
  //     <Route path={`/html/readium-css-docs`}>
  //       <WebReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl={`${origin}/samples/ReadiumCSS-docs/manifest.json`}
  //       />
  //     </Route>
  //     <Route path={`/html/use-html-reader-hook`}>
  //       <UseHtmlReader
  //         injectablesReflowable={htmlInjectablesReflowable}
  //         webpubManifestUrl={`${origin}/samples/moby-epub2-exploded/manifest.json`}
  //         manifest={mobyEpub2Manifest as WebpubManifest}
  //       />
  //     </Route>
  //     <Route path={`/html/url/:manifestUrl`}>
  //       <DynamicReader />
  //     </Route>
  //     <Route path={`/html/test`}>
  //       <Tests />
  //     </Route>
  //   </Switch>
  // );
};

const HomePage = () => {
  const [dynamicHref, setValue] = React.useState('');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value);
  return (
    <Box m={2}>
      <Heading as="h1">NYPL Web Reader</Heading>
      <Heading as="h2" fontSize={2} mt={3}>
        Generic Examples
      </Heading>
      <UnorderedList p={4}>
        {/* <ListItem>
          EPUB2 Based Webpubs
          <UnorderedList>
            <ListItem>
              <Link to="/html/moby-epub2">Moby Dick </Link>
            </ListItem>
            <ListItem>
              <Link to="/html/use-html-reader-hook">useHtmlReader hook</Link>
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          EPUB3 Based Webpubs
          <UnorderedList>
            <ListItem>
              <Link to="/html/moby-epub3">Moby Dick (EPUB 3)</Link>
            </ListItem>
            <ListItem>
              <Link to="/html/moby-epub3-no-local-storage">
                Moby Dick (EPUB 3)
              </Link>{' '}
              - does not persist location or settings to local storage
            </ListItem>
            <ListItem>
              <Link to="/html/readium-css-docs">
                Readium CSS Documentation (as Webpub)
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/html/fixed-layout">Fixed Layout (Illustrated)</Link>
            </ListItem>
            <ListItem>
              <Link to="/html/fxl-poems">Fixed Layout (Poems)</Link>
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Remote hosted WebPubs
          <UnorderedList>
            <ListItem>
              <Link to="/html/streamed-alice-epub">
                Alice's Adventures in Wonderland
              </Link>
              <Text as="i">
                &nbsp;(streamed from https://alice.dita.digital)
              </Text>
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          Embedded Reader
          <UnorderedList>
            <ListItem>
              <Link to="/html/fixed-height-embedded-moby-epub2">
                Fixed-height Embedded Moby Dick
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/html/growing-embedded-moby-epub2">
                Growing-height Embedded Moby Dick
              </Link>
            </ListItem>
          </UnorderedList>
        </ListItem> */}
        <ListItem>
          PDFs
          <UnorderedList>
            <ListItem>
              <Link to="/pdf/single-resource-short">Single-PDF Webpub</Link>
            </ListItem>
            {/* <ListItem>
              <Link to="/pdf/use-pdf-reader-hook">usePdfReader hook</Link>
            </ListItem>
            <ListItem>
              <Link to="/pdf/large">Single-PDF Webpub (large file)</Link>
            </ListItem>
            <ListItem>
              <Link to="/pdf/collection">Multi-PDF Webpub</Link>
            </ListItem>
            <ListItem>
              <Link to="/pdf/fixed-height-embedded-collection">
                Fixed-height embedded PDF
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/pdf/growing-height-embedded-collection">
                Growing-height embedded PDF
              </Link>
            </ListItem> */}
          </UnorderedList>
        </ListItem>
        {/* <ListItem>
          Bring your own manifest:
          <Stack direction="row" alignItems="center">
            <Input
              maxW={500}
              value={dynamicHref}
              onChange={handleChange}
              placeholder="Webpub Manifest URL"
              mr={2}
            />
            <Button
              as={Link}
              to={`/html/url/${encodeURIComponent(dynamicHref)}`}
            >
              Go
            </Button>
          </Stack>
        </ListItem> */}
      </UnorderedList>
    </Box>
  );
};

const DynamicReader: React.FC = () => {
  const { manifestUrl } = useParams<{ manifestUrl: string }>();
  const decoded = decodeURIComponent(manifestUrl);
  return (
    <WebReader
      injectablesReflowable={htmlInjectablesReflowable}
      webpubManifestUrl={decoded}
    />
  );
};

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
