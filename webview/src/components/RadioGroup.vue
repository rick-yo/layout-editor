<script setup lang="ts">
import { CSSProperties } from 'vue';

export interface RadioGroupProps {
  options: {
    value: string;
    url: string;
    style?: CSSProperties;
  }[];
  selected?: string;
}

const props = defineProps<RadioGroupProps>()
const emit = defineEmits<{
  (event: 'select', selected: string): void
}>()

function select(value: string) {
  if (value === props.selected) {
    emit('select', '')
  } else {
    emit('select', value)
  }
}

</script>

<template>
  <div class="group">
    <img
      v-for="(item) in options"
      class="icon"
      :class="{ 'activeIcon': selected === item.value }"
      @click="select(item.value)"
      :src="item.url"
      :style="item.style"
    />
  </div>
</template>

<style scoped>
.group {
  display: flex;
  cursor: pointer;
}
.icon {
  border: 0.5px solid rgb(57, 58, 59);
  width: 25px;
  height: 25px;
  color: #5F6368;
  --icon-normal-color: #9aa0a6;
  filter: invert(39%) sepia(16%) saturate(169%) hue-rotate(173deg) brightness(91%) contrast(87%);
}
.activeIcon {
  --icon-active-color: #1a73e8;
  /* HACK see https://stackoverflow.com/questions/22252472/how-to-change-the-color-of-an-svg-element */
  filter: invert(31%) sepia(94%) saturate(2311%) hue-rotate(203deg)
    brightness(96%) contrast(88%);
}
</style>
