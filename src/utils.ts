import * as vscode from 'vscode';

const commandName = 'layout.editor';
const SUPPORTS_FILE_TYPES = [
  'css',
  'less',
  'sass',
  'scss',
  'vue',
  // 'rml',
  // 'html',
];

const FLEX_REG = /display\s*:\s*flex\s*;/gi;
const FLEX_PROPERTY = {
  justifyContent: 'justify-content',
  flexDirection: 'flex-direction',
  flexWrap: 'flex-wrap',
  alignContent: 'align-content',
  alignItems: 'align-items',
};
const FLEX_PROPERTY_REG = new RegExp(
  `(${Object.values(FLEX_PROPERTY).join('|')}|display)\\s*:\\s*([a-z-]+)\\s*;`,
  'gi'
);
const emptyFlexProps = {
  [FLEX_PROPERTY.flexDirection]: '',
  [FLEX_PROPERTY.flexWrap]: '',
  [FLEX_PROPERTY.alignContent]: '',
  [FLEX_PROPERTY.justifyContent]: '',
  [FLEX_PROPERTY.alignItems]: '',
};

function findEditorByFsPath(fsPath: string): vscode.TextEditor | undefined {
  return vscode.window.visibleTextEditors.find((textEditor) => {
    return textEditor.document.uri.fsPath === fsPath;
  });
}

enum WorkSpaceStateKeys {
  flexDeclarations = 'flexDeclarations',
  fsPath = 'fsPath',
  pickerPanel = 'pickerPanel',
}

interface FlexDeclaration {
  name: string;
  value: string;
  line: number;
  character: number;
  match: string;
}

const stateManagerMap = new WeakMap<vscode.ExtensionContext, WorkSpaceState>();

class WorkSpaceState {
  state: {
    [WorkSpaceStateKeys.flexDeclarations]: FlexDeclaration[];
    [WorkSpaceStateKeys.fsPath]: string;
    [WorkSpaceStateKeys.pickerPanel]: vscode.WebviewPanel | null;
  } = {
    flexDeclarations: [],
    fsPath: '',
    pickerPanel: null,
  };
  constructor() {}

  get flexDeclarations(): FlexDeclaration[] {
    return this.state[WorkSpaceStateKeys.flexDeclarations] || [];
  }
  set flexDeclarations(value: FlexDeclaration[]) {
    this.state[WorkSpaceStateKeys.flexDeclarations] = value;
  }

  get fsPath(): string {
    return this.state[WorkSpaceStateKeys.fsPath];
  }

  set fsPath(value: string) {
    this.state[WorkSpaceStateKeys.fsPath] = value;
  }

  get pickerPanel() {
    return this.state[WorkSpaceStateKeys.pickerPanel];
  }

  set pickerPanel(value: vscode.WebviewPanel | null) {
    this.state[WorkSpaceStateKeys.pickerPanel] = value;
  }
}

function createWorkSpaceState(context: vscode.ExtensionContext) {
  let instance = stateManagerMap.get(context);
  if (instance) {
    return instance;
  }
  instance = new WorkSpaceState();
  stateManagerMap.set(context, instance);
  return instance;
}

function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export {
  commandName,
  SUPPORTS_FILE_TYPES,
  FLEX_REG,
  FLEX_PROPERTY,
  FLEX_PROPERTY_REG,
  findEditorByFsPath,
  createWorkSpaceState,
  FlexDeclaration,
  emptyFlexProps,
  cloneDeep,
};
