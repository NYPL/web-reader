import { defineConfig } from 'tsup';

/**
 * Clean output folder
 * Build esm version (for: import WebReader from "@nypl/web-reader")
 * Build cjs version (for: const WebReader = require("@nypl/web-reader"))
 * Compile injectable CSS files (is this used?)
 * Generate TS declarations
 */

export default defineConfig({
  entry: {
    index: 'src/index.tsx',
    'injectable-html-styles/ReadiumCSS-before':
      'src/HtmlReader/ReadiumCss/ReadiumCSS-before.css',
    'injectable-html-styles/ReadiumCSS-default':
      'src/HtmlReader/ReadiumCss/ReadiumCSS-default.css',
    'injectable-html-styles/ReadiumCSS-after':
      'src/HtmlReader/ReadiumCss/ReadiumCSS-after.css',
  },
  format: ['esm', 'cjs'],
  sourcemap: true,
  dts: true,
  target: ['es2020', 'chrome100', 'firefox100', 'safari15', 'edge100'],
  clean: true,
  minify: false,
});
