<script setup lang="ts">
import { reactive } from 'vue';
import { alignContentIcons, resolveIconUrl } from './assets/iconResolver';
import RadioGroup from './components/RadioGroup.vue'
const vscode = acquireVsCodeApi();

const alignContentOptions = Object.keys(alignContentIcons).map((value) => ({ url: resolveIconUrl(alignContentIcons[value]), value }))
const flexProperties: Record<string, string> = reactive({
  'flex-direction': '',
  'flex-wrap': '',
  'align-content': '',
  'justify-content': '',
  'align-items': '',
});

function fromSelectHandler(name: string) {
  return (value: string) => {
    flexProperties[name] = value;
    vscode.postMessage({
      name,
      value
    });
  }
}

</script>

<template>
  <div v-for="(value, name) in flexProperties">
    <div>{{ name }}: {{ value }}</div>
    <RadioGroup
      :options="alignContentOptions"
      :selected="flexProperties['align-content']"
      @select="fromSelectHandler('align-content')"
    />
  </div>
</template>

<style>
</style>
