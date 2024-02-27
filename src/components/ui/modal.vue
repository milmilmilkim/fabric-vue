<template>
  <div
    class="z-[39] fixed top-0 left-0 bg-black bg-opacity-60 w-full h-full"
  ></div>
  <div
    class="z-40 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg min-h-96 bg-white border"
  >
    <div @click="$emit('close')" class="w-full p-1 flex justify-end text-2xl">
      X
    </div>

    <div class="p-2">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(["close"]);
</script>
