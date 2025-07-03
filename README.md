# NYPL Web Reader

This project is a web reader built by NYPL for reading eBooks. It was designed using the [Readium Architecture](https://github.com/readium/architecture), and specifically built for Webpubs. Webpub is a spec [defined by the Readium Foundation](https://github.com/readium/webpub-manifest) to provide a common abstraction between many types of web publications. This project currently focuses on HTML-based Webpubs and Webpubs that define PDF collections. An HTML-based Webpub can be generated from many types of eBooks, but most commonly ePubs.

## Demo - Example App

This project features an example application under `/example`, which is deployed here: https://nypl-web-reader.vercel.app.

## Built With

- [esbuild](https://esbuild.github.io/) - JavaScript bundler for the web-reader package
- [react-pdf](https://react-pdf.org/) - For creating PDF files on the browser and server
- [chakra-ui](https://chakra-ui.com/) - For styling the default UI components
- [TypeScript](https://www.npmjs.com/package/typescript) - JavaScript with syntax for types
- [React](https://www.npmjs.com/package/react) - For creating user interface components
- [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/) - For writing unit tests
- The Example App is packaged with [Parcel](https://parceljs.org/) & deployed with [Vercel](https://vercel.com/).

## Features

- [x] HTML-based webpub support (for EPUB, MOBI, etc formats)
- [x] PDF-based webpub support
- [x] Customizable UI
- [x] User settings
  - [x] Font family (HTML only)
  - [x] Font size (HTML only)
  - [x] Color scheme (night, day, sepia)
  - [x] Fullscreen
  - [x] Paginated / Scrolling mode toggle
  - [x] Zoom (PDF only)
- [x] WAI-ARIA compliant accessibility
- [x] Integration tested
- [ ] Offline support (prefetch and cache desired content via Service Worker, along with host app shell)
- [ ] Saving bookmarks / highlights

## Examples

Basic usage within a React app, using the default UI:

```typescript
import WebReader from '@nypl/web-reader';

const ReaderPage = ({ manifestUrl }) => {
  return (
    <WebReader
      webpubManifest={manifestUrl}
      headerLeft={<button>Back to app</button>}
    />
  );
};
```

- [More React examples](/example/index.tsx) - Includes examples that render EPUB2 & EPUB3 based webpubs, remote hosted webpubs, and PDFs
- [usePDFReader hook example](/example/use-pdf-reader.tsx) - Useful for instances when you know you're only going to be using the web-reader to open PDFs
- [useHTMLReader hook example](/example/use-html-reader.tsx) - Useful for cases when you know you're only going to be using the web-reader to read EPUBs
- [Real-world example: Open eBooks Web](https://github.com/NYPL/ereading-clients/blob/staging/apps/oew/src/components/theme-ui/WebReader.tsx) - NYPL application for children to read books on the web. This demonstrates how encrypted AxisNow content is passed to the web-reader.
- [Real-world example: Digital Research Books (DRB)](https://github.com/NYPL/sfr-bookfinder-front-end/blob/development/src/components/ReaderLayout/ReaderLayout.tsx) - NYPL application that collects digital versions of research books into one convenient place to search.

## Required Fonts

In order for the Settings panel to be displayed as intended, the fonts Roboto, Georgia, and OpenDyslexic must be available to your application. Georgia is web safe, meaning it is installed by default on most devices, but the others are not. One way to include them is to copy them from the `fonts` folder in `@nypl/web-reader/example/static` into your `/public` directory. Alternatively, for Roboto, you can embed the Google Font into the <head> of your html (directions [here](https://fonts.google.com/specimen/Roboto)).

## Required CSS Injectables for the HTML Reader (EPUBs)

**Note:** This section does not apply to PDFs

The HTML Reader can inject `<style>` tags (and other tags) into the reader iframe itself, called an "injectable". This is used to add styles to the html content of the publication.

In order for the web-reader to render EPUBs correctly and display the OpenDyslexic font, there are some files that you must import into your application and inject into the `<WebReader />`. Those files are as follows:

1. The `opendyslexic` font
2. The three default Readium stylesheets

We export the Readium CSS stylesheets compiled under `@nypl/web-reader/dist/injectable-html-styles/*.css`. These css files can then be imported via webpack as a url to a static file that is copied to the dist folder. You can then use this url in your injectable config.

**Example:**
You will need to install `file-loader`, `extract-loader`, and `css-loader` and import the files you need like this:

```ts
import readiumBefore from '!file-loader!extract-loader!css-loader!@nypl/web-reader/dist/injectable-html-styles/ReadiumCSS-before.css';
import readiumDefault from '!file-loader!extract-loader!css-loader!@nypl/web-reader/dist/injectable-html-styles/ReadiumCSS-default.css';
import readiumAfter from '!file-loader!extract-loader!css-loader!@nypl/web-reader/dist/injectable-html-styles/ReadiumCSS-after.css';

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

// The `fontInjectable` uses a plain url to a css file that we host normally on our site. In this case you would be responsible for copying the css file into your source code and making sure it is hosted at some location.
const fontInjectable: Injectable = {
  type: 'style',
  url: `${origin}/fonts/opendyslexic/opendyslexic.css`,
  fontFamily: 'opendyslexic',
};

const htmlInjectables = [...cssInjectables, fontInjectable];

const Reader = () => {
  return (
    <WebReader
      injectablesReflowable={htmlInjectables}
      webpubManifestUrl="example/manifest.json"
    />
  );
};
```

A real-world [example](https://github.com/NYPL/sfr-bookfinder-front-end/blob/development/src/components/ReaderLayout/ReaderLayout.tsx) can be seen in the Digital Research Books project.

Alternatively, you can host those three Readium CSS files within your project and import them wherever you render the <WebReader />. This is what we are doing in [Open eBooks](https://github.com/NYPL/ereading-clients/tree/staging/apps/oew/public/css/readium), which enables us to support offline reading mode.

### injectablesFixed vs. injectablesReflowable

There are two different injectables props you can pass to the web reader.

- `injectablesReflowable` is used by HTML-based text books, or any content that makes sense to be resized based on the screen size. For most cases, this is where you should add the Readium CSS files mentioned above.
- `injectablesFixed` is being used in Open eBooks as a way to style picture books. It could also be used to style other formats like audio and video files.

Your app can provide both props or only one. The reader will decide which one to load into the iframe based on the book format defined in the webpub manifest.

## Other Injectables

You can import and inject other files into the `<WebReader />` to customize behavior. For example, in Open eBooks, we import some [custom JavaScript](https://github.com/NYPL/ereading-clients/blob/staging/apps/oew/src/components/theme-ui/WebReader.tsx#L65) to disable right clicking & copying copywritten content.

## Custom Styling

Basic default styling is included in the basic UI. We are using [Chakra](https://chakra-ui.com/) to style the default UI components. You can wrap our UI components in your own `<ThemeProvider>` to pass your own custom theme.

## Errors

We make every effort to throw useful errors. Your app should probably wrap the web reader component in a React `<ErrorBoundary>` to either display the thrown errors or a custom error state for your users in the case one is thrown.

## Modifying PDF Manifests

In some cases it may be desirable to modify the Webpub Manifest before passing it to the web reader. One example of this is with single-resource PDFs. These manifests sometimes arrive without a table of contents. The information for the TOC is embedded in the single PDF file itself. In this situation, we have set up a utility to extract the PDF TOC and add it to the manifest. There is an example of this working at [`/pdf/single-resource-short`](https://nypl-web-reader.vercel.app/pdf/single-resource-short).

In order to make this work in your app, you will want to:

1. Fetch your manifest
1. Use `addTocToManifest` to add the table of contents
1. Generate a synthetic URL for the in-memory JSON object
1. Pass this generated URL to the web reader.

<details>
<summary>See the example code</summary>

```ts
const fetchAndModifyManifest: Fetcher<string, string> = async (url) => {
  const response = await fetch(url);
  const manifest = await response.json();
  const modifiedManifest = await addTocToManifest(
    manifest,
    getProxiedResource(pdfProxyUrl),
    pdfWorkerSrc
  );
  const syntheticUrl = URL.createObjectURL(
    new Blob([JSON.stringify(modifiedManifest)])
  );
  return syntheticUrl;
};

const SingleResourcePdf = () => {
  const { data: modifiedManifestUrl, isLoading } = useSWR<string>(
    '/samples/pdf/single-resource-short.json',
    fetchAndModifyManifest
  );

  if (isLoading || !modifiedManifestUrl) return <div>Loading...</div>;

  return (
    <WebReader
      webpubManifestUrl={modifiedManifestUrl}
      proxyUrl={pdfProxyUrl}
      pdfWorkerSrc={`${origin}/pdf-worker/pdf.worker.min.js`}
    />
  );
};
```

</details>

## Architecture

One of the primary architectural goals of the web reader is to abstract away the particularities of the many individual publication formats by using a common manifest to describe all publication types. This is the [Readium Webpub Manifest](https://readium.org/webpub-manifest/profiles/epub.html). This allows the web-reader to consume Webpub Manifests, not manipulate or generate them.

- ePubs are generally run through a Streamer, which fetches the full compressed ePub, generates a manifest for it, and then serves the individual pieces separately. Processing EPUBs into Webpub Manifests can be done with a Readium Streamer or some other way. [epub-to-webpub](https://github.com/NYPL/ePub-to-webpub) is used in the [Open eBooks](https://github.com/NYPL/ereading-clients/tree/staging/apps/oew) project and generates Webpub Manifests from EPUBs and the web-reader consumes them. Digital Research Books generates Webpub manifests for EPUBs using a [Python script](https://github.com/NYPL/drb-etl-pipeline/blob/main/managers/webpubManifest.py).
- On the PDF side, we don't have a shared utility for generating manifests, but the Digital Research Books project does use a [Python script](https://github.com/NYPL/drb-etl-pipeline/blob/main/managers/webpubManifest.py) to pre-generate PDF manifests from web-scraped content before sending them to the web-reader. These manifests are then stored in an S3 bucket.

A Webpub Manifest gives us metadata and the structure of the publication with links to the content. Depending on the `metadata.conformsTo` field, we know which type of reader to use to render the publication. Each media type (HTML for EPUBS, PDF for PDF publications, etc) has its own `use_X_Reader` hook (`usePdfReader`, `useHtmlReader`, etc).

C4 Models have been created to demonstrate how the WebReader and other web reading utilities interact with the DRB & Open eBooks apps. View them here: https://structurizr.com/share/72104

**Notes:**

- There is one `use_X_Reader` per _media-type_ (PDF, HTML, Image, etc), not per _format_. As in, ePub and Mobi books are different formats that use the same media type (HTML). Audiobooks and PDF collections use different media types. We currently only have plans for HTML and PDF, but other hooks are welcome and should fit right in.
- AxisNow encrypted ePubs are served uncompressed. We will generate the manifest for them on the client before instantiating the reader.

### Pieces of the Architecture

1. **use_X_Reader Hook**

- Takes in the Webpub Manifest and returns:
  - `State` of the reader, such as current settings and location.
  - `Content` of the reader for the consuming component to render wherever.
  - `Navigator`, which is just an object conforming to the `Navigator` type, which defines the API to interact with the reader (`goForward`, `changeColorMode`, etc). We will make every effort to have our `Navigator` object conform to the [Readium Navigator API spec](https://github.com/readium/architecture/blob/master/navigator/public-api.md).
- Internally, it will instantiate whatever package is being used to control that media type, and render the contents into the `Content` element it returns.
- Each hook for each media type separately manages its own state using a redux-style `useReducer` hook. There is a basic set of common state that is shared and returned from the `use_X_Reader` hook, but custom internal state can also be added, such as the `D2Reader` instance in the `useHtmlReader` hook.

2. **useWebReader Hook**

- This is a generic hook that works for both PDF manifests and HTML-type manifests. It will internally call the proper `use_X_Reader` hook for you, and pass through the return value.

3. **Reader UI Components**

- Accepts the state and methods returned from the useWebReader hook.
- Renders the React UI
  - Header, controls, table of contents, etc
- Exports both a default `WebReader` component, and individual components that the consuming application can use and style themselves: `ReaderNav`, `ReaderFooter`, `PreviousButton`, etc.

This is the folder structure:

```txt
/example            # example app packaged by Parcel
  index.html
  index.tsx         # entrypoint for the demo app
/src
  /HtmlReader       # the HTML Reader used for ePub or any other HTML content
  /PdfReader        # a stub for the coming PDF Reader
  /ui               # the react components for our default UI
    manager.tsx     # the fully-formed default UI
  /utils
  index.tsx         # exports the main React Component <WebReader />
  types.ts          # commonly used types
  useWebReader.tsx  # the React hook providing the main API into the reader
/test
  blah.test.tsx     # unit tests go here
```

### Decryption

The web reader does support DRM via two possible routes:

1. The default Readium suggested method is to have a server-side "streamer" between the content server and the application. This server would fetch the encrypted DRM content, decrypt it, and then serve the decrypted assets individually to the client alongside a webpub manifest pointing to these decrypted assets. One example of such a streamer is [readium/r2-streamer-js](https://github.com/readium/r2-streamer-js).
1. If decryption cannot be performed in a streamer, the web-reader can support client-side decryption of licensed content. This is done by passing a `getContent` function to either the `<WebReader>` component or the `useWebReader` hook. It has the type signature `(resourceUrl: string) => Promise<string>`, and can thus be used to fetch and decrypt (or otherwise manipulate) content before it is passed to the iframe for rendering.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [Publishing to NPM](#publishing-to-npm) for notes on how to publish a new version to NPM.

### Prerequisites

1. Before getting started, be sure to run `npm install`.

2. In order to open any of the PDF examples in the Example App, you'll need to allow urls in a `WebpubManifest` to be proxied. This is done by passing a `proxyUrl` to the `<WebReader>` component. In order to do that, you must have a proxy running somewhere.

We have set up a small express-based CORS proxy that can be run for local development.

- Run the proxy with `npm run cors-proxy`.
- Pass the proxy url to the example app by setting the following env var in a `.env` file at the root of the project: `CORS_PROXY_URL="http://localhost:3001/?requestUrl="`.
- In a separate terminal session, start the example app: `npm run example`.

### Running the Example App

To run the example app for local development:

```bash
npm run example
```

The example will rebundle on change, but you have to refresh your browser to see changes (no hot reloading currently).

## Development Notes

### Performance Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

You can also choose to install and use [invariant](https://github.com/palmerhq/tsdx#invariant) and [warning](https://github.com/palmerhq/tsdx#warning) functions.

### Module Formats

CJS and ESModules module formats are supported.

The appropriate paths are configured in `package.json` and `dist/index.js` accordingly. Please [report](https://github.com/NYPL-Simplified/web-reader/issues) if any issues are found.

## Running the Tests

### Unit Tests with Jest

To run Jest in watch mode:

```bash
npm run test
```

To run all the tests as they run in CI:

```bash
npm run test:ci
```

## Code Quality & Bundle Size Checks

- `npm run lint` to lint the code yourself. Code quality enforcement is set up in pre-commit hooks with `prettier`, `husky`, and `lint-staged`.
- `npm run size` - to calculate the real cost of the library for consumers (using [size-limit](https://github.com/ai/size-limit))
- `npm run analyze` - to analyze the library bundle for places we can shrink down

## Continuous Integration

There are three Github Actions Workflows:

- `main` - installs deps w/ cache, lints, tests, and builds on all pushes against a Node and OS matrix
- `size` - comments cost comparison of your library on every pull request using [size-limit](https://github.com/ai/size-limit)

## Versioning

We use [SemVer](https://semver.org/) for versioning. For the versions available, see the [releases](https://github.com/NYPL-Simplified/web-reader/releases) on this repository.

## Publishing to NPM

To publish the package to [NPM](https://www.npmjs.com/package/@nypl/web-reader), you must first be added to the `nypl` organization within NPM.

Run `npm run release` from the main branch. Follow the prompts to add a new version, publish a release to github, and push to npm.

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
