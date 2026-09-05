/**
 * CSS properties accepted by `cx()`.
 *
 * Bare numbers are treated like React's `style` prop: they get a `px` suffix
 * except on unitless properties (`lineHeight`, `opacity`, `zIndex`, `flex`, ...).
 *
 * This list is intentionally curated rather than exhaustive; add properties as needed.
 * Custom properties (`--foo`) are always allowed.
 */
export interface CSSProperties {
  // Custom properties
  [customProperty: `--${string}`]: string | number;

  // Layout
  display?: 'none' | 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'contents' | (string & {});
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  inset?: string | number;
  insetInline?: string | number;
  insetBlock?: string | number;
  insetInlineStart?: string | number;
  insetInlineEnd?: string | number;
  insetBlockStart?: string | number;
  insetBlockEnd?: string | number;
  zIndex?: string | number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | (string & {});
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  visibility?: 'visible' | 'hidden' | 'collapse';
  float?: 'left' | 'right' | 'none';
  clear?: 'left' | 'right' | 'both' | 'none';

  // Flexbox
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexFlow?: string;
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end' | (string & {});
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | 'start' | 'end' | (string & {});
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch' | (string & {});
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | (string & {});
  flex?: string | number;
  flexGrow?: string | number;
  flexShrink?: string | number;
  flexBasis?: string | number;
  order?: string | number;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;

  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridTemplate?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  placeItems?: string;
  placeContent?: string;
  placeSelf?: string;

  // Sizing
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  aspectRatio?: string | number;

  // Spacing
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  marginInline?: string | number;
  marginBlock?: string | number;
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  paddingInline?: string | number;
  paddingBlock?: string | number;

  // Typography
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic' | 'oblique' | (string & {});
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
  textDecoration?: string;
  textDecorationLine?: string;
  textDecorationColor?: string;
  textDecorationStyle?: string;
  textDecorationThickness?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textOverflow?: 'clip' | 'ellipsis' | (string & {});
  textIndent?: string | number;
  textShadow?: string;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
  textWrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty' | 'stable';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  wordSpacing?: string | number;
  overflowWrap?: 'normal' | 'break-word' | 'anywhere';
  hyphens?: 'none' | 'manual' | 'auto';
  verticalAlign?: string;

  // Colors
  color?: string;
  backgroundColor?: string;
  opacity?: string | number;

  // Borders
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderWidth?: string | number;
  borderTopWidth?: string | number;
  borderRightWidth?: string | number;
  borderBottomWidth?: string | number;
  borderLeftWidth?: string | number;
  borderStyle?: string;
  borderTopStyle?: string;
  borderRightStyle?: string;
  borderBottomStyle?: string;
  borderLeftStyle?: string;
  borderColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRadius?: string | number;
  borderTopLeftRadius?: string | number;
  borderTopRightRadius?: string | number;
  borderBottomLeftRadius?: string | number;
  borderBottomRightRadius?: string | number;
  borderCollapse?: 'collapse' | 'separate';
  borderSpacing?: string | number;

  // Outline
  outline?: string;
  outlineWidth?: string | number;
  outlineStyle?: string;
  outlineColor?: string;
  outlineOffset?: string | number;

  // Background
  background?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  backgroundClip?: string;
  backgroundOrigin?: string;
  backgroundBlendMode?: string;

  // Effects
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  mixBlendMode?: string;

  // Transforms
  transform?: string;
  transformOrigin?: string;
  transformStyle?: string;
  translate?: string;
  rotate?: string;
  scale?: string | number;
  perspective?: string | number;
  perspectiveOrigin?: string;

  // Transitions & Animations
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
  animation?: string;
  animationName?: string;
  animationDuration?: string;
  animationTimingFunction?: string;
  animationDelay?: string;
  animationIterationCount?: string | number;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;

  // Interactivity
  cursor?: string;
  pointerEvents?: 'auto' | 'none' | (string & {});
  userSelect?: 'none' | 'auto' | 'text' | 'all' | 'contain';
  touchAction?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';

  // Lists
  listStyle?: string;
  listStyleType?: string;
  listStylePosition?: string;
  listStyleImage?: string;

  // Tables
  tableLayout?: 'auto' | 'fixed';
  captionSide?: 'top' | 'bottom';
  emptyCells?: 'show' | 'hide';

  // SVG
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  strokeLinecap?: string;
  strokeLinejoin?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string | number;

  // Other
  content?: string;
  appearance?: string;
  boxSizing?: 'content-box' | 'border-box';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  willChange?: string;
  isolation?: 'auto' | 'isolate';
  contain?: string;
  contentVisibility?: 'visible' | 'auto' | 'hidden';
  caretColor?: string;
  accentColor?: string;
  scrollBehavior?: 'auto' | 'smooth';
  scrollSnapType?: string;
  scrollSnapAlign?: string;
  scrollMargin?: string | number;
  scrollPadding?: string | number;
  overscrollBehavior?: string;
  clipPath?: string;
  containerType?: 'normal' | 'size' | 'inline-size';
  containerName?: string;
  colorScheme?: string;
  fieldSizing?: 'fixed' | 'content';
}

