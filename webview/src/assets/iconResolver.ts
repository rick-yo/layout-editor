const FLEX_PROPERTY = {
  justifyContent: 'justify-content',
  flexDirection: 'flex-direction',
  flexWrap: 'flex-wrap',
  alignContent: 'align-content',
  alignItems: 'align-items',
};

function resolveFlexIcon(property: string, value: string) {
  return `${property}-${value}`;
}
const resolveAlignContentIcon = (value: string) =>
  resolveFlexIcon(FLEX_PROPERTY.alignContent, value);
const resolveJustifyContentIcon = (value: string) =>
  resolveFlexIcon(FLEX_PROPERTY.justifyContent, value);
const resolveAlignItemsIcons = (value: string) =>
  resolveFlexIcon(FLEX_PROPERTY.alignItems, value);

const flexDirectionIcons = {
  row: 'flex-direction',
  column: 'flex-direction',
};
const flexWrapIcons = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
};
const alignContentIcons = {
  center: resolveAlignContentIcon('center'),
  'flex-start': resolveAlignContentIcon('start'),
  'flex-end': resolveAlignContentIcon('end'),
  'space-around': resolveAlignContentIcon('space-around'),
  'space-between': resolveAlignContentIcon('space-between'),
  stretch: resolveAlignContentIcon('stretch'),
};
const justifyContentIcons = {
  center: resolveJustifyContentIcon('center'),
  'flex-start': resolveJustifyContentIcon('flex-start'),
  'flex-end': resolveJustifyContentIcon('flex-end'),
  'space-around': resolveJustifyContentIcon('space-around'),
  'space-between': resolveJustifyContentIcon('space-between'),
  'space-evenly': resolveJustifyContentIcon('space-evenly'),
};
const alignItemsIcons = {
  center: resolveAlignItemsIcons('center'),
  'flex-start': resolveAlignItemsIcons('flex-start'),
  'flex-end': resolveAlignItemsIcons('flex-end'),
  stretch: resolveAlignItemsIcons('stretch'),
  baseline: 'baseline',
};

const CDN_PREFIX =
  'https://cdn.jsdelivr.net/gh/luvsic3/layout-editor/assets/css/';

function resolveIconUrl(name: string) {
  return `${CDN_PREFIX}${name}.svg`;
}

export {
  resolveFlexIcon,
  alignContentIcons,
  resolveIconUrl,
  flexDirectionIcons,
  FLEX_PROPERTY,
  flexWrapIcons,
  justifyContentIcons,
  alignItemsIcons,
};
