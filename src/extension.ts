import vscode from 'vscode';
import fs from 'fs';
import assert from 'assert';
import {
  commandName,
  SUPPORTS_FILE_TYPES,
  FLEX_REG,
  FLEX_PROPERTIES,
  FLEX_PROPERTY_REG,
  createFlexDecoration,
} from './utils';

interface FlexDeclaration {
  name: string;
  value: string;
  line: number;
  character: number;
  match: string;
}

function activate(context: vscode.ExtensionContext) {
  let flexDeclarations: FlexDeclaration[];
  let currentDocument: vscode.TextDocument;
  let pickerPanel: vscode.WebviewPanel | null = null;

  const activeEditor = vscode.window.activeTextEditor;
  const iconDecorationType = createFlexDecoration(context);

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

  vscode.window.onDidChangeTextEditorSelection(() => {
    const activeEditor = vscode.window.activeTextEditor;
    flexDeclarations = collectFlexDeclaration(activeEditor);
  });

  const disposableCommand = vscode.commands.registerCommand(commandName, () => {
    if (!pickerPanel) {
      pickerPanel = vscode.window.createWebviewPanel(
        commandName,
        'Layout Editor',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          enableCommandUris: true,
        }
      );
      context.subscriptions.push(
        pickerPanel.onDidDispose(() => {
          pickerPanel = null;
        })
      );

      // Handle messages from the webview
      context.subscriptions.push(
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
            message.name,
            message.value,
            targetTextEditor
          );
        })
      );
    } else {
      pickerPanel.reveal();
    }

    const webviewPath = context.asAbsolutePath('/webview/dist/index.html');
    let html = fs.readFileSync(webviewPath, 'utf-8');
    html = html.replace('$FS_PATH', currentDocument.uri.fsPath);
    // .replace('$PROPERTY_NAME', currentFlexProperty.name)
    // .replace('$PROPERTY_VALUE', currentFlexProperty.value);
    pickerPanel.webview.html = html;
  });

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

  function updateFlexProperty(
    propertyName: string,
    propertyValue: string,
    editor?: vscode.TextEditor
  ) {
    editor?.edit((builder) => {
      const newText = `${propertyName}: ${propertyValue};`;
      const declaration = flexDeclarations.find(
        (item) => item.name === propertyName
      );
      assert(declaration, 'flex property not found');
      builder.replace(
        new vscode.Range(
          new vscode.Position(declaration.line, declaration.character),
          new vscode.Position(
            declaration.line,
            declaration.character + declaration.match.length
          )
        ),
        newText
      );
    });
  }

  context.subscriptions.push(
    disposableCommand,
    disposableHoverProvider,
    disposableChangeDocument,
    disposableVisibleTextEditors
  );
}

function deactivate() {}

export { activate, deactivate };

function collectFlexDeclaration(editor?: vscode.TextEditor) {
  const declarations: FlexDeclaration[] = [];
  if (!editor) {
    return declarations;
  }
  const document = editor.document;
  const cursorPosition = editor.selection.active;
  let ruleSetStartLine = cursorPosition.line;
  let ruleSetEndLine = cursorPosition.line;

  while (ruleSetStartLine > -1) {
    if (document.lineAt(ruleSetStartLine).text.includes('{')) {
      break;
    }
    ruleSetStartLine--;
  }
  while (ruleSetEndLine < document.lineCount) {
    if (document.lineAt(ruleSetStartLine).text.includes('}')) {
      break;
    }
    ruleSetEndLine++;
  }
  for (
    let currentLine = ruleSetStartLine;
    currentLine < ruleSetEndLine;
    currentLine++
  ) {
    const text = document.lineAt(currentLine).text;
    const matchArrays = [...text.matchAll(FLEX_PROPERTY_REG)];
    matchArrays.forEach((matchArray) => {
      if (!matchArray.index) {
        return;
      }
      const [match, catch1, catch2] = matchArray;
      declarations.push({
        name: catch1,
        value: catch2,
        line: currentLine,
        character: matchArray.index,
        match,
      });
    });
  }
  return declarations;
}

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
