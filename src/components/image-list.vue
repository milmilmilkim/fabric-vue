<template>
  <div class="w-full flex flex-wrap">
    <img
      v-for="(url, index) in urls"
      :key="index"
      :src="url"
      class="w-28 h-28 object-cover cursor-pointer"
      @click="selectImage(url)"
    />
    <modal v-if="currentImage && isShowCropper" @close="isShowCropper = false">
      <cropper
        :is-lock="isLock"
        :img-url="currentImage"
        :width="originalSize?.width"
        :height="originalSize?.height"
        :canvas="{
          height: originalSize.width,
          width: originalSize.height,
        }"
        @set-image="setImage"
      />
    </modal>
  </div>
</template>

<script setup lang="ts">
import { getImageList } from "../firebase/storage";
import { computed, onMounted, ref, inject } from "vue";
import cropper from "./cropper.vue";
import modal from "./ui/modal.vue";

interface Props {
  type?: "ADD" | "REPLACE";
  selectedObjects?: fabric.Object[];
}
const originalSize = computed(() => ({
  width: props.selectedObjects?.length && props.selectedObjects[0].width,
  height: props.selectedObjects?.length && props.selectedObjects[0].height,
}));
const props = withDefaults(defineProps<Props>(), { type: "ADD" });
const emits = defineEmits(["setImage"]);
const urls = ref<string[]>([]);
const currentImage = ref("");
const isShowCropper = ref(false);
const isLock = computed(() => props.type === "REPLACE");
onMounted(async () => {
  urls.value = await getImageList();
});

const selectImage = (url: string) => {
  currentImage.value = url;
  isShowCropper.value = true;
};

const setImage = (result: { image: string }) => {
  emits("setImage", result.image);
  isShowCropper.value = false;
};
</script>
