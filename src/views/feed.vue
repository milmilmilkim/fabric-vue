<template>
  <div class="max-w-6xl w-full m-auto mt-10 bg-gray-50 min-h-10">
    <masonry-grid
      class="container"
      :gap="5"
      align="justify"
      defaultDirection="end"
      :column="6"
      :columnSize="0"
      :columnSizeRatio="0"
    >
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
      <div class="item">4</div>
      <div class="item">5</div>
      <div class="item">6</div>
      <div class="item">7</div>
      <div class="item">8</div>
      <div class="item">9</div>
      <div class="item">10</div>
    </masonry-grid>
  </div>
</template>

<script setup lang="ts">
import { MasonryGrid } from "@egjs/vue-grid";
import axios from "axios";
import { onMounted, ref } from "vue";

const imageItem = ref([]);

const fetchImage = async () => {
  const res = await axios.get("https://picsum.photos/v2/list");
};

onMounted(() => {
  fetchImage();
});
</script>

<style>
html,
body {
  position: relative;
  height: 100%;
}

.item {
  position: absolute;
  width: 100px;
  /* border: 1px solid #ccc; */
  color: white;
  text-align: center;
}

.item:nth-child(6n + 1) {
  background: #f55;
  height: 200px;
}

.item:nth-child(6n + 2) {
  background: #7e7;
  height: 300px;
}

.item:nth-child(6n + 3) {
  background: #66e;
  height: 200px;
}

.item:nth-child(6n + 4) {
  background: #4af;
  height: 100px;
}

.item:nth-child(6n + 5) {
  background: #ed5;
  height: 150px;
}
.item:nth-child(6n + 6) {
  background: #d5e;
  height: 130px;
}
</style>
