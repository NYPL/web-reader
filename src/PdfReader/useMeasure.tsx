import * as React from 'react';

declare const window: Window &
  typeof globalThis & {
    ResizeObserver: ResizeObserver;
  };
export type Dimensions = Pick<
  DOMRectReadOnly,
  'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'
>;
export type UseMeasureRef<E extends Element = Element> = (element: E) => void;
export type UseMeasureResult<E extends Element = Element> = [
  UseMeasureRef<E> | null,
  Dimensions,
];

const DEFAULT_DIMENSION = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

export default function useMeasure<
  E extends Element = Element,
>(): UseMeasureResult<E> {
  // this is a little trick to get a reference to an HTML element. Using useRef wouldn't
  // work because we actually need rerenders when it changes, to update the useLayoutEffect
  const [element, ref] = React.useState<E | null>(null);
  const [rect, setRect] = React.useState<Dimensions>(DEFAULT_DIMENSION);
  const observer = React.useMemo(
    () =>
      new window.ResizeObserver(
        (
          entries: {
            contentRect: {
              x: number;
              y: number;
              width: number;
              height: number;
              top: number;
              left: number;
              bottom: number;
              right: number;
            };
          }[]
        ) => {
          if (entries[0]) {
            const { x, y, width, height, top, left, bottom, right } =
              entries[0].contentRect;
            setRect({ x, y, width, height, top, left, bottom, right });
          }
        }
      ),
    []
  );

  React.useLayoutEffect(() => {
    if (!element) return;
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, observer]);

  return [ref, rect];
}
