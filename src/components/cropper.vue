<template>
  <p>size</p>
  {{ width }}
  {{ height }}
  <cropper
    :src="imgUrl"
    :image-restriction="imageRestriction"
    @change="change"
    :default-size="defaultSize"
  />
  <button @click="setImage" class="bg-blue-50 py-1 px-3 my-5 float-end">
    확인
  </button>
</template>

<script setup lang="ts">
import {
  Cropper,
  type CropperResult,
  type TransformParams,
} from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

import { computed, reactive } from "vue";

interface Props {
  imgUrl: string;
  width?: number;
  height?: number;
  isLock?: boolean;
}
const props = defineProps<Props>();
const etmis = defineEmits(["setImage"]);

const result = reactive<{ image: string }>({ image: "" });

const change = ({ coordinates, canvas, image }: CropperResult) => {
  result.image = canvas?.toDataURL()!;
};

const defaultSize = ({ imageSize, visibleArea }: TransformParams) => {
  return {
    width: (props.isLock && props.width) || (visibleArea || imageSize).width,
    height:
      (props.isLock && props.height) ||
      props.height ||
      (visibleArea || imageSize).height,
  };
};

const imageRestriction = computed(() => {
  return props.isLock ? "none" : "fit-area";
});

const setImage = () => {
  etmis("setImage", result);
};
</script>
