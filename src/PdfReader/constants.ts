// Constants specific to PdfReader (zoom limits, layout spacing, scroll behavior).
import { PageSize } from './types';

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 5;
export const SCALE_STEP = 0.1;
export const PAGE_GAP = 16;
export const PAGE_PADDING = 32;
export const RENDER_ROOT_MARGIN = '300px 0px 300px 0px';
export const PAGE_MEASURE_BUFFER = 2;
export const DEFAULT_PAGE_SIZE: PageSize = { width: 612, height: 792 };
export const SCROLLSPY_ANCHOR_RATIO = 0.3;
