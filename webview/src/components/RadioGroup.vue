<script setup lang="ts">
interface RadioGroupProps {
  options: {
    value: string;
    url: string;
  }[];
  selected?: string;
}

defineProps<RadioGroupProps>()
const emit = defineEmits<{
  (event: 'select', selected: string): void
}>()

function select(value: string) {
  emit('select', value)
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
    />
  </div>
</template>

<style scoped>
.group {
  /* --primary-color: rgb(26 115 232); */
  --border-color: rgb(57, 58, 59);
  display: flex;
  cursor: pointer;
}
.icon {
  border: 0.5px solid var(--border-color);
  width: 25px;
  height: 25px;
}
.activeIcon {
  /* HACK see https://stackoverflow.com/questions/22252472/how-to-change-the-color-of-an-svg-element */
  filter: invert(31%) sepia(94%) saturate(2311%) hue-rotate(203deg)
    brightness(96%) contrast(88%);
}
</style>
