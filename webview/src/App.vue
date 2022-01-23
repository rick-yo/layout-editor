<script setup lang="ts">
import { WebviewApi } from 'vscode-webview';
import { reactive, ref } from 'vue';
import { alignContentIcons, alignItemsIcons, flexDirectionIcons, flexWrapIcons, FLEX_PROPERTY, justifyContentIcons, resolveIconUrl } from './assets/iconResolver';
import RadioGroup, { RadioGroupProps } from './components/RadioGroup.vue'

const vscode = (() => {
  let vs: Window | WebviewApi<any> = window;
  try {
    vs = acquireVsCodeApi()
  } finally {
    return vs;
  }
})();

function makeOptions(iconMap: Record<string, string>) {
  return Object.keys(iconMap).map((value) => ({ url: resolveIconUrl(iconMap[value]), value }))
}

const flexDirectionOptions: RadioGroupProps['options'] = [
  {
    url: resolveIconUrl(flexDirectionIcons.row),
    value: 'row',
    style: {
      transform: 'scale(-1, 1) rotate(90deg)'
    },
  },
  {
    url: resolveIconUrl(flexDirectionIcons.column),
    value: 'column',
  },
]
const flexWrapOptions = makeOptions(flexWrapIcons)
const alignContentOptions = makeOptions(alignContentIcons)
const justifyContentOptions = makeOptions(justifyContentIcons)
const alignItemsOptions = makeOptions(alignItemsIcons)
const flexOptionsMap = {
  [FLEX_PROPERTY.flexDirection]: flexDirectionOptions,
  [FLEX_PROPERTY.flexWrap]: flexWrapOptions,
  [FLEX_PROPERTY.alignContent]: alignContentOptions,
  [FLEX_PROPERTY.justifyContent]: justifyContentOptions,
  [FLEX_PROPERTY.alignItems]: alignItemsOptions,
}

const flexProperties: Record<string, string> = reactive({
  [FLEX_PROPERTY.flexDirection]: '',
  [FLEX_PROPERTY.flexWrap]: '',
  [FLEX_PROPERTY.alignContent]: '',
  [FLEX_PROPERTY.justifyContent]: '',
  [FLEX_PROPERTY.alignItems]: '',
});

const fsPath = ref('')

function fromSelectHandler(name: string, value: string) {
  flexProperties[name] = value;
  vscode.postMessage({
    name,
    value,
    fsPath: fsPath.value,
  });
}

window.addEventListener('message', event => {
  const message = event.data;

  switch (message.command) {
    case 'setState':
      Object.assign(flexProperties, message.data)
      fsPath.value = message.fsPath;
      break;
  }
});
</script>

<template>
  <div class="editor">
    <div v-for="(value, name) in flexProperties">
      <div>
        <span class="radioLabel">{{ name }}</span>
        :
        <span class="radioValue">{{ value }}</span>
      </div>
      <RadioGroup
        :options="flexOptionsMap[name]"
        :selected="flexProperties[name]"
        @select="value => fromSelectHandler(name, value)"
      />
    </div>
  </div>
</template>

<style>
.editor {
  --color-syntax-1: rgb(200 0 0);
  --color-text-primary: rgb(32 33 36);
}
.vscode-dark .editor {
  --color-syntax-1: rgb(53 212 199);
  --color-text-primary: rgb(232 234 237);
}
.radioLabel {
  color: var(--color-syntax-1);
}

.radioValue {
  color: var(--color-text-primary);
}
</style>
