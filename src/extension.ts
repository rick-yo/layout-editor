import * as vscode from 'vscode';
import * as fs from 'fs';

const commandName = 'layout.editor';

const FLEX_REG = /display\s*:\s*flex\s*;/gi;

const SUPPORTS_FILE_TYPES = [
  'css',
  'less',
  'sass',
  'scss',
  'rml',
  'vue',
  'html',
];

function decorateIcon(
  editor: vscode.TextEditor,
  iconDecorationType: vscode.TextEditorDecorationType
) {
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

function activate(context: vscode.ExtensionContext) {
  let currentFlexPropertyNameAndValueRange: vscode.Range;
  let currentFlexProperty: { name: string; value: string };
  let currentDocument: vscode.TextDocument;
  let pickerPanel: vscode.WebviewPanel | null;

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

  const activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    decorateIcon(activeEditor, iconDecorationType);
  }

  const disposableVisibleTextEditors =
    vscode.window.onDidChangeVisibleTextEditors(() => {
      decorateIcon(
        vscode.window.activeTextEditor as vscode.TextEditor,
        iconDecorationType
      );
    });

  const disposableChangeDocument = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const openEditor = vscode.window.visibleTextEditors.filter(
        (editor) => editor.document.uri === event.document.uri
      )[0];
      decorateIcon(openEditor, iconDecorationType);
    }
  );

  const disposableCommand = vscode.commands.registerCommand(commandName, () => {
    if (pickerPanel === null) {
      pickerPanel = vscode.window.createWebviewPanel(
        commandName,
        'Layout Editor',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          enableCommandUris: true,
        }
      );
      pickerPanel.onDidDispose(
        () => {
          // When the panel is closed, cancel any future updates to the webview content
          pickerPanel = null;
        },
        null,
        context.subscriptions
      );

      // Handle messages from the webview
      pickerPanel.webview.onDidReceiveMessage(async (message) => {
        const targetFsPath = message.fsPath;
        let targetTextEditor: vscode.TextEditor | undefined;
        vscode.window.visibleTextEditors.forEach((textEditor) => {
          if (textEditor.document.uri.fsPath === targetFsPath) {
            targetTextEditor = textEditor;
          }
        });

        if (!targetTextEditor) {
          const uri = vscode.Uri.file(targetFsPath);
          targetTextEditor = await vscode.window.showTextDocument(uri, {
            viewColumn: vscode.ViewColumn.Beside,
          });
        }
        updateFlexProperty(
          targetTextEditor,
          message.propertyName,
          message.propertyValue
        );
      });
    } else {
      pickerPanel.reveal();
    }

    const webviewPath = context.asAbsolutePath('/src/flexbox-picker.html');
    let html = fs.readFileSync(webviewPath, 'utf-8');
    html = html
      .replace('$FS_PATH', currentDocument.uri.fsPath)
      .replace('$PROPERTY_NAME', currentFlexProperty.name)
      .replace('$PROPERTY_VALUE', currentFlexProperty.value);
    pickerPanel.webview.html = html;
  });

  function updateFlexProperty(
    editor: vscode.TextEditor,
    propertyName: string,
    propertyValue: string
  ) {
    editor.edit((builder) => {
      const newText = `${propertyName}: ${propertyValue};`;
      builder.replace(currentFlexPropertyNameAndValueRange, newText);
      // Update range for picker udpate at some position
      currentFlexPropertyNameAndValueRange =
        currentFlexPropertyNameAndValueRange.with(
          currentFlexPropertyNameAndValueRange.start,
          new vscode.Position(
            currentFlexPropertyNameAndValueRange.start.line,
            currentFlexPropertyNameAndValueRange.start.character +
              newText.length
          )
        );
    });
  }

  const hoverProvider: vscode.HoverProvider = {
    provideHover(doc, pos) {
      const range = doc.getWordRangeAtPosition(pos, FLEX_REG);

      if (range === undefined) {
        return;
      }

      const hoverText = doc.getText(range);
      const match = FLEX_REG.exec(hoverText);
      if (match) {
        currentDocument = doc;
        currentFlexProperty = {
          name: match[1],
          value: match[4],
        };
        currentFlexPropertyNameAndValueRange = range;
      }

      const commandUri = vscode.Uri.parse(`command:${commandName}`);
      const markedString = new vscode.MarkdownString(
        `[Open Layout Editor 💬](${commandUri} "Open Layout Editor")`
      );

      markedString.isTrusted = true;

      return new vscode.Hover(markedString);
    },
  };

  const disposableHoverProvider = vscode.languages.registerHoverProvider(
    SUPPORTS_FILE_TYPES,
    hoverProvider
  );

  context.subscriptions.push(
    disposableCommand,
    disposableHoverProvider,
    disposableChangeDocument,
    disposableVisibleTextEditors
  );
}

function deactivate() {}

export { activate, deactivate };
