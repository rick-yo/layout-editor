import vscode from 'vscode';
import fs from 'fs';
import assert from 'assert';
import {
  commandName,
  createWorkSpaceState,
  findEditorByFsPath,
  FlexDeclaration,
  FLEX_PROPERTY_REG,
  SUPPORTS_FILE_TYPES,
} from '../utils';

function command(context: vscode.ExtensionContext) {
  const workspace = createWorkSpaceState(context);

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      if (isValidEditor(e.textEditor)) {
        collectMessageData(e.textEditor);
        postMessageToWebview();
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      const targetEditor = findEditorByFsPath(e.document.uri.fsPath);
      if (isValidEditor(targetEditor as vscode.TextEditor)) {
        collectMessageData(targetEditor);
        postMessageToWebview();
      }
    })
  );

  const disposableCommand = vscode.commands.registerCommand(commandName, () => {
    let pickerPanel = workspace.pickerPanel;
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
          workspace.pickerPanel = null;
        })
      );

      // Handle messages from the webview
      context.subscriptions.push(
        pickerPanel.webview.onDidReceiveMessage(async (message) => {
          const targetFsPath = message.fsPath;
          let targetTextEditor = findEditorByFsPath(targetFsPath);

          if (!targetTextEditor) {
            const uri = vscode.Uri.file(targetFsPath);
            targetTextEditor = await vscode.window.showTextDocument(uri, {
              viewColumn: vscode.ViewColumn.Beside,
            });
          }
          updateEditorFlexProperty(
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
    const html = fs.readFileSync(webviewPath, 'utf-8');
    pickerPanel.webview.html = html;
    workspace.pickerPanel = pickerPanel;
    postMessageToWebview();
  });

  function collectMessageData(editor?: vscode.TextEditor) {
    workspace.flexDeclarations = collectFlexDeclaration(editor);
    workspace.fsPath = editor?.document.uri.fsPath ?? '';
    assert(workspace.fsPath, 'fsPath not found');
  }

  function postMessageToWebview() {
    const flexProperties = workspace.flexDeclarations.reduce<
      Record<string, string>
    >((prev, curr) => {
      prev[curr.name] = curr.value;
      return prev;
    }, {});
    workspace.pickerPanel?.webview.postMessage({
      command: 'setState',
      data: flexProperties,
      fsPath: workspace.fsPath,
    });
  }

  function updateEditorFlexProperty(
    propertyName: string,
    propertyValue: string,
    editor?: vscode.TextEditor
  ) {
    editor?.edit((builder) => {
      const newText = `${propertyName}: ${propertyValue};`;
      const declaration = workspace.flexDeclarations.find(
        (item) => item.name === propertyName
      );
      if (declaration) {
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
      } else {
        const displayDeclaration = workspace.flexDeclarations.find(
          (item) => item.name === 'display'
        );
        assert(displayDeclaration, `display: flex; css rule not found`);
        builder.insert(
          new vscode.Position(
            displayDeclaration.line + 1,
            displayDeclaration.character
          ),
          `${newText}`
        );
      }
    });
  }

  context.subscriptions.push(disposableCommand);
}

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

function isValidEditor(editor: vscode.TextEditor) {
  return SUPPORTS_FILE_TYPES.some((fileType) =>
    editor.document.fileName.includes(fileType)
  );
}

export { command };
