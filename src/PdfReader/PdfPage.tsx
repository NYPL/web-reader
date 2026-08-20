import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { AnnotationLayer, TextLayer } from 'pdfjs-dist';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { PageSize, RefProxy } from './types';
import { getRotatedSize, toError } from './utils';

interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: number;
  baseSize: PageSize;
  isVisible: boolean;
  registerContainer: (pageNumber: number, el: HTMLDivElement | null) => void;
  goToPage: (pageNumber: number) => void;
  onError: (pageNumber: number, error: Error) => void;
}

/**
 * A single page: a fixed-size placeholder (so the scrollbar/layout never
 * jumps) whose canvas/text/annotation layers only get painted once the
 * page scrolls near the viewport (`isVisible`), and re-painted whenever
 * `scale`/`rotation` change.
 */
const PdfPage = React.memo(function PdfPage({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  baseSize,
  isVisible,
  registerContainer,
  goToPage,
  onError,
}: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const annotationLayerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const textLayerTaskRef = useRef<{ cancel: () => void } | null>(null);
  const renderedKeyRef = useRef<string | null>(null);

  const releaseRenderedContent = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
      canvas.style.width = '0px';
      canvas.style.height = '0px';
    }
    if (textLayerRef.current) {
      textLayerRef.current.innerHTML = '';
      textLayerRef.current.style.removeProperty('--scale-factor');
    }
    if (annotationLayerRef.current) {
      annotationLayerRef.current.innerHTML = '';
    }
    renderedKeyRef.current = null;
  }, []);

  const rotated = useMemo(
    () => getRotatedSize(baseSize, rotation),
    [baseSize, rotation]
  );
  const displayWidth = rotated.width * scale;
  const displayHeight = rotated.height * scale;

  useEffect(() => {
    if (!isVisible) {
      renderTaskRef.current?.cancel();
      textLayerTaskRef.current?.cancel();
      textLayerTaskRef.current = null;
      releaseRenderedContent();
      return undefined;
    }

    const key = `${scale}|${rotation}`;
    if (renderedKeyRef.current === key) return undefined;

    let cancelled = false;

    const run = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const textLayerDiv = textLayerRef.current;
        const annotationLayerDiv = annotationLayerRef.current;
        if (!canvas || !textLayerDiv || !annotationLayerDiv) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;
        annotationLayerDiv.style.width = `${viewport.width}px`;
        annotationLayerDiv.style.height = `${viewport.height}px`;

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        const task = page.render({
          canvasContext: ctx,
          viewport,
          transform,
        });
        renderTaskRef.current = task;

        await task.promise;
        if (cancelled) return;

        textLayerDiv.innerHTML = '';
        textLayerDiv.innerHTML = '';
        textLayerDiv.style.setProperty(
          '--scale-factor',
          String(viewport.scale)
        );
        if (textLayerTaskRef.current) {
          textLayerTaskRef.current.cancel();
          textLayerTaskRef.current = null;
        }
        try {
          const textContent = await page.getTextContent();
          const textLayer = new TextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport,
          });
          textLayerTaskRef.current = textLayer;
          await textLayer.render();
        } catch {
          // Non-fatal: some pages have no extractable text, and
          // TextLayer.cancel() rejects the in-flight render promise by design.
        }
        if (cancelled) return;

        annotationLayerDiv.innerHTML = '';
        try {
          const annotations = await page.getAnnotations({ intent: 'display' });
          const linkService = {
            goToDestination: async (dest: string | unknown[] | null) => {
              let d = dest;
              if (typeof d === 'string') d = await pdfDoc.getDestination(d);
              if (Array.isArray(d)) {
                const idx = await pdfDoc.getPageIndex(d[0] as RefProxy);
                goToPage(idx + 1);
              }
            },
            goToPage: (n: number) => goToPage(n),
            getDestinationHash: () => '#',
            getAnchorUrl: () => '#',
            addLinkAttributes: () => {
              void 0;
            },
            setHash: () => {
              void 0;
            },
            executeNamedAction: () => {
              void 0;
            },
            executeSetOCGState: () => {
              void 0;
            },
            get pagesCount() {
              return 0;
            },
            get page() {
              return 0;
            },
            set page(_: number) {
              void 0;
            },
            get rotation() {
              return 0;
            },
            set rotation(_: number) {
              void 0;
            },
            get isInPresentationMode() {
              return false;
            },
            get externalLinkEnabled() {
              return true;
            },
            set externalLinkEnabled(_: boolean) {
              void 0;
            },
          };

          const layer = new AnnotationLayer({
            div: annotationLayerDiv,
            accessibilityManager: null,
            annotationCanvasMap: null,
            annotationEditorUIManager: null,
            structTreeLayer: null,
            page,
            viewport: viewport.clone({ dontFlip: true }),
          });

          await layer.render({
            viewport: viewport.clone({ dontFlip: true }),
            div: annotationLayerDiv,
            annotations,
            page,
            linkService,
            annotationStorage: undefined,
            renderForms: true,
          });
        } catch {
          // Non-fatal: annotation rendering support varies by pdf.js version.
        }

        if (!cancelled) renderedKeyRef.current = key;
      } catch (err: unknown) {
        if (cancelled) return;
        if (
          err instanceof Error &&
          err.name === 'RenderingCancelledException'
        ) {
          return;
        }
        const nextError = toError(err, `Failed to render page ${pageNumber}`);
        onError(pageNumber, nextError);
      }
    };

    run();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      textLayerTaskRef.current?.cancel();
      textLayerTaskRef.current = null;
    };
  }, [
    isVisible,
    scale,
    rotation,
    pdfDoc,
    pageNumber,
    goToPage,
    onError,
    releaseRenderedContent,
  ]);

  useEffect(
    () => () => {
      renderTaskRef.current?.cancel();
      textLayerTaskRef.current?.cancel();
      releaseRenderedContent();
    },
    [releaseRenderedContent]
  );

  return (
    <div
      className="pdf-page-wrap"
      data-page-number={pageNumber}
      ref={(el) => registerContainer(pageNumber, el)}
      style={{ width: displayWidth, height: displayHeight, overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        className="pdf-canvas"
        style={{ width: displayWidth, height: displayHeight }}
      />
      <div
        ref={textLayerRef}
        className="pdf-text-layer textLayer"
        style={{ width: displayWidth, height: displayHeight }}
      />
      <div
        ref={annotationLayerRef}
        className="pdf-annotation-layer annotationLayer"
        style={{ width: displayWidth, height: displayHeight }}
      />
    </div>
  );
});

export default PdfPage;
