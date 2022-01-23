import vscode from 'vscode';
import { FLEX_REG } from '../utils';

function decorate(context: vscode.ExtensionContext) {
  const iconDecorationType = createFlexDecoration(context);

  decorateEditors(iconDecorationType, vscode.window.visibleTextEditors);

  context.subscriptions.push(
    vscode.window.onDidChangeVisibleTextEditors((visibleEditors) => {
      decorateEditors(iconDecorationType, visibleEditors);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const [openEditor] = vscode.window.visibleTextEditors.filter(
        (editor) => editor.document.uri === event.document.uri
      );
      decorateIcon(iconDecorationType, openEditor);
    })
  );
}

function decorateEditors(
  iconDecorationType: vscode.TextEditorDecorationType,
  editors: readonly vscode.TextEditor[]
) {
  editors.forEach((editor) => {
    decorateIcon(iconDecorationType, editor);
  });
}

function decorateIcon(
  iconDecorationType: vscode.TextEditorDecorationType,
  editor?: vscode.TextEditor
) {
  if (!editor) {
    return;
  }
  const sourceCode = editor.document.getText();

  const decorationsArray: {
    range: vscode.Range;
  }[] = [];

  const sourceCodeArr = sourceCode.split('\n');
  sourceCodeArr.forEach((sourceCode, line) => {
    const matches = [...sourceCode.matchAll(FLEX_REG)];

    matches.forEach((match) => {
      if (!match.index) {
        return;
      }
      const character = match.index + match[0].length;
      const range = new vscode.Range(
        new vscode.Position(line, character),
        new vscode.Position(line, character + 1)
      );

      decorationsArray.push({
        range,
      });
    });
  });

  editor.setDecorations(iconDecorationType, decorationsArray);
}

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

export { decorate };
