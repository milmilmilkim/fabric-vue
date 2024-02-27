<template>
  <div class="p-5 flex justify-between bg-gray-50 w-full mb-5">
    <div>
      <button @click="handleClickImageList" class="p-1 mr-3 bg-gray-200">이미지 추가</button>
      <button class="p-1 mr-3 bg-gray-200" @click="handleUploadClick">업로드 이미지</button>
      <button @click="canvasControls.addText('Text')" class="p-1 mr-3 bg-gray-200">텍스트 추가</button>
      <button :disabled="!canvasControls.selectedObjects.value.length" @click="canvasControls.deleteActiveObjects" class="p-1 bg-red-100 disabled:text-gray-400 disabled:bg-gray-50">선택 삭제</button>
      <input :value="canvasControls.currentZoom.value" class="ml-3" type="text" readonly />
    </div>

    <div>
      <button @click="loadDefaultTemplate" class="p-1 bg-gray-200 mr-3">기본 템플릿 불러오기</button>
      <button @click="isShowModal = true" class="p-1 bg-gray-200 mr-3">JSON 불러오기</button>

      <button class="p-1 mr-3 bg-gray-200" @click="save">JSON 내보내기</button>
      <button @click="exportImage" class="p-1 bg-gray-200 mr-3">이미지 저장하기</button>
    </div>
  </div>

  <modal v-if="isShowImageList" @close="isShowImageList = false">
    <image-list @set-image="addImage" />
  </modal>

  <modal v-if="isShowModal" @close="isShowModal = false">
    <div>
      <textarea class="w-full h-40" v-model="jsonTemplate"></textarea>
      <button @click="loadTemplate" class="text-blue-500 mr-3">불러오기</button>
      <button class="mr-3" @click="jsonTemplate = ''">비우기</button>
      <button @click="jsonTemplate = defaultTemplateString">기본</button>
    </div>
  </modal>

  <modal v-if="canvasControls.isShowImageModal.value" @close="canvasControls.closeImageModal()">
    <h2>이미지 교체하기</h2>
    <image-list type="REPLACE" @setImage="replaceImage" :selectedObjects="canvasControls.selectedObjects.value" />
  </modal>

  <template v-if="isShowUploader">
    <modal @close="isShowUploader = false">
      <img v-if="preview" class="mb-3 w-16 h-16 object-cover" :src="preview" alt="이미지 파일 미리보기" />
      <input type="file" accept="image/*" @change="handleChangeFile" />
      <button class="p-1 bg-blue-50" @click="handleClickUpload">업로드</button>
    </modal>
  </template>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { FabricJson, useFabricCanvas } from './fabricComposable';
import modal from './ui/modal.vue';
import { uploadImage } from '../firebase/storage';
import imageList from './image-list.vue';

const isShowModal = ref(false);
const isShowUploader = ref(false);

const defaultTemplate = {
  version: '5.3.0',
  objects: [
    {
      type: 'rect',
      version: '5.3.0',
      originX: 'left',
      originY: 'top',
      left: -2,
      top: -2,
      width: 1922,
      height: 1082,
      fill: 'white',
      stroke: null,
      strokeWidth: 1,
      strokeDashArray: null,
      strokeLineCap: 'butt',
      strokeDashOffset: 0,
      strokeLineJoin: 'miter',
      strokeUniform: false,
      strokeMiterLimit: 4,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      shadow: null,
      visible: true,
      backgroundColor: '',
      fillRule: 'nonzero',
      paintFirst: 'fill',
      globalCompositeOperation: 'source-over',
      skewX: 0,
      skewY: 0,
      rx: 0,
      ry: 0,
      selectable: false,
      evented: false,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      hasControls: true,
      source: 'background',
    },
    {
      type: 'textbox',
      version: '5.3.0',
      originX: 'left',
      originY: 'top',
      left: 88.79999999999984,
      top: 691.1999999999998,
      width: 371.14,
      height: 45.2,
      fill: 'rgb(0,0,0)',
      stroke: null,
      strokeWidth: 1,
      strokeDashArray: null,
      strokeLineCap: 'butt',
      strokeDashOffset: 0,
      strokeLineJoin: 'miter',
      strokeUniform: false,
      strokeMiterLimit: 4,
      scaleX: 2.5873684635642857,
      scaleY: 2.5873684635642857,
      angle: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      shadow: null,
      visible: true,
      backgroundColor: '',
      fillRule: 'nonzero',
      paintFirst: 'fill',
      globalCompositeOperation: 'source-over',
      skewX: 0,
      skewY: 0,
      fontFamily: 'Times New Roman',
      fontWeight: 'normal',
      fontSize: 40,
      text: 'Design Your Banner',
      underline: false,
      overline: false,
      linethrough: false,
      textAlign: 'left',
      fontStyle: 'normal',
      lineHeight: 1.16,
      textBackgroundColor: '',
      charSpacing: 0,
      styles: [],
      direction: 'ltr',
      path: null,
      pathStartOffset: 0,
      pathSide: 'left',
      pathAlign: 'baseline',
      minWidth: 20,
      splitByGrapheme: false,
      selectable: true,
      evented: true,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
    },
    {
      type: 'image',
      version: '5.3.0',
      originX: 'left',
      originY: 'top',
      left: 83.99999999999977,
      top: 83.99999999999989,
      width: 1536,
      height: 864,
      fill: 'rgb(0,0,0)',
      stroke: null,
      strokeWidth: 0,
      strokeDashArray: null,
      strokeLineCap: 'butt',
      strokeDashOffset: 0,
      strokeLineJoin: 'miter',
      strokeUniform: false,
      strokeMiterLimit: 4,
      scaleX: 0.6129999999999998,
      scaleY: 0.6129999999999998,
      angle: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      shadow: null,
      visible: true,
      backgroundColor: '',
      fillRule: 'nonzero',
      paintFirst: 'fill',
      globalCompositeOperation: 'source-over',
      skewX: 0,
      skewY: 0,
      cropX: 0,
      cropY: 0,
      selectable: true,
      evented: true,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false,
      src: 'https://firebasestorage.googleapis.com/v0/b/image-test-storage.appspot.com/o/images%2Fb5405462-a097-4813-b569-da4e639221da?alt=media',
      filters: [],
    },
  ],
} as any as FabricJson;

const defaultTemplateString = JSON.stringify(defaultTemplate);
const jsonTemplate = ref(defaultTemplateString);

const emits = defineEmits(['json']);
const canvasControls = inject('canvasControls') as ReturnType<typeof useFabricCanvas>;

const loadTemplate = () => {
  canvasControls.loadTemplateJSON(JSON.parse(jsonTemplate.value));
  isShowModal.value = false;
};

const loadDefaultTemplate = () => {
  canvasControls.loadTemplateJSON(defaultTemplate);
};
const save = () => {
  const result = canvasControls.exportJSON();
  emits('json', result);
};

const replaceImage = (payload: string) => {
  canvasControls.replaceImg(payload);
  canvasControls.closeImageModal();
};

const isShowImageList = ref(false);
const handleClickImageList = () => {
  isShowImageList.value = true;
};

const handleUploadClick = () => {
  isShowUploader.value = true;
};

const handleChangeFile = (e: Event) => {
  const targetEl = e.target as HTMLInputElement;
  const files = targetEl.files;
  if (files && files.length > 0) {
    const file = files[0];
    image.value = file;
    handleFile(file);
    targetEl.value = '';
  }
};

const preview = ref<string>('');

const image = ref<File | undefined>(undefined);

const handleFile = (file: File) => {
  const reader = new FileReader();

  reader.onloadend = () => {
    preview.value = (reader.result as string) || '';
  };

  if (file) {
    reader.readAsDataURL(file);
  }
};

const handleClickUpload = async () => {
  if (image.value) {
    try {
      const url = await uploadImage(image.value);
      console.log(url);
    } catch (err) {
      alert('업로드 실패');
    } finally {
      isShowUploader.value = false;
    }
  }
};

const addImage = (payload: string) => {
  canvasControls.addImg(payload);
  isShowImageList.value = false;
};

const exportImage = () => {
  canvasControls.exportImage();
};
</script>
