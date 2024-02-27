<template>
  <div class="m-auto max-w-6xl flex flex-col justify-center items-center bg-blue-200">
    <tool v-if="canvasControls.initialized.value" @json="setJSON" />

    <div class="bg-[#EAEAEA]">
      <canvas class="w-[800] h-[800]" ref="canvasElRef"> </canvas>
    </div>

    <div class="flex w-full bg-gray-50 mt-5">
      <div class="w-1/2 p-3">
        <textarea class="w-full h-40 border" :value="canvasControls.selectedObjects.value.toString()"></textarea>
      </div>
      <div class="w-1/2 p-3">
        <textarea class="w-full h-40 border" :value="output"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, provide, computed } from 'vue';
import { useFabricCanvas } from '@/components/fabricComposable';
import tool from '@/components/tool.vue';

const canvasElRef = ref<HTMLCanvasElement | undefined>(undefined);
const canvasControls = useFabricCanvas();
const output = ref('');

const setJSON = (jsonObject: object) => {
  output.value = JSON.stringify(jsonObject);
};

provide('canvasControls', canvasControls);

onMounted(() => {
  canvasControls.init(canvasElRef, 1500, 600);
});

onBeforeUnmount(() => {
  console.log('dispose');
  canvasControls.dispose();
});
</script>
