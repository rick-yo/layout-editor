function resolveFlexIcon(property: string, value: string) {
  return `${property}-${value}`;
}

const resolveAlignContentIcon = (value: string) =>
  resolveFlexIcon('align-content', value);

const alignContentIcons: Record<string, string> = {
  center: resolveAlignContentIcon('center'),
  end: resolveAlignContentIcon('end'),
  'space-around': resolveAlignContentIcon('space-around'),
  'space-between': resolveAlignContentIcon('space-between'),
  'space-evenly': resolveAlignContentIcon('space-evenly'),
  start: resolveAlignContentIcon('start'),
  stretch: resolveAlignContentIcon('stretch'),
};

function resolveIconUrl(name: string) {
  return new URL(`../assets/css/${name}.svg`, import.meta.url).href;
}

export { resolveFlexIcon, alignContentIcons, resolveIconUrl };
