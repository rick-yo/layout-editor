import * as vscode from 'vscode';

const commandName = 'layout.editor';
const SUPPORTS_FILE_TYPES = [
  'css',
  'less',
  'sass',
  'scss',
  'rml',
  'vue',
  'html',
];

const FLEX_REG = /display\s*:\s*flex\s*;/gi;
const FLEX_PROPERTIES = {
  justifyContent: 'justify-content',
  flexDirection: 'flex-direction',
  flexWrap: 'flex-wrap',
  alignContent: 'align-content',
  alignItems: 'align-items',
};
const FLEX_PROPERTY_REG = new RegExp(
  `(${Object.values(FLEX_PROPERTIES).join('|')}|display)\\s*:\\s*([a-z-]+)\\s*;`,
  'gi'
);

function createFlexDecoration(context: vscode.ExtensionContext) {
  const iconDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: ' ',
      margin: '0.1em 0.2em 0 0.2em',
      width: '.8rem',
      height: '0.8em',
    },
    dark: {
      after: {
        contentIconPath: context.asAbsolutePath(
          '/assets/flexbox-icon-light.svg'
        ),
      },
    },
    light: {
      after: {
        contentIconPath: context.asAbsolutePath(
          '/assets/flexbox-icon-dark.svg'
        ),
      },
    },
  });
  return iconDecorationType;
}

export {
  commandName,
  SUPPORTS_FILE_TYPES,
  FLEX_REG,
  FLEX_PROPERTIES,
  FLEX_PROPERTY_REG,
  createFlexDecoration,
};
