import { ref, onMounted, onUnmounted, Ref } from 'vue';
import { fabric } from 'fabric';

type FabricBackgroundImage = any; // 라이브러리에 type이 없어서 any 사용

interface CustomFabricObject extends fabric.Object {
  source?: 'background';
  crossOrigin?: 'anonymouse';
}
export interface FabricJson {
  version: string;
  objects: CustomFabricObject[];
  backgroundImage?: FabricBackgroundImage;
}

export function useFabricCanvas() {
  let canvas: fabric.Canvas;
  let canvasEl: HTMLCanvasElement;

  const CONTAINER_WIDTH = 800;
  const CONTAINER_HEIGHT = 800;

  const OFFSET = 2;

  let canvasWidth = 800;
  let canvasHeight = 600;

  let scaleFactor = 1;
  const currentZoom = ref(1);
  const center = { x: 0, y: 0 };

  let background: CustomFabricObject;
  const selectedObjects = ref<fabric.Object[]>([]);
  const isShowImageModal = ref(false);
  const initialized = ref(false);

  let history: FabricJson[] = [];
  let isHistoryLocked = false;
  let currentHistoryIndex = 0;

  let clipboard: fabric.Object | null = null;

  let isDragging = false;
  let lastPosX: number;
  let lastPosY: number;

  let lastClickedTime = 0;
  const doubleClickThreshold = 500;

  const setZoom = (zoom: number) => {
    const point = new fabric.Point(CONTAINER_WIDTH / 2, CONTAINER_HEIGHT / 2);
    canvas.zoomToPoint(point, zoom);
    currentZoom.value = zoom;
  };

  const resetZoom = () => {
    setZoom(scaleFactor);
    canvas?.absolutePan(new fabric.Point(-center.x, -center.y));
  };

  const setCenter = (width: number, height: number) => {
    canvasWidth = width;
    canvasHeight = height;
    const widthRatio = CONTAINER_WIDTH / canvasWidth;
    const heightRatio = CONTAINER_HEIGHT / canvasHeight;

    scaleFactor = Math.min(widthRatio, heightRatio);

    center.x = CONTAINER_WIDTH / 2 - (canvasWidth * scaleFactor) / 2;
    center.y = CONTAINER_HEIGHT / 2 - (canvasHeight * scaleFactor) / 2;

    // 원본 이미지 크기가 캔버스 크기와 같거나 작으면 확대 하지 않고 원본 사이즈
    if (scaleFactor >= 1) {
      setZoom(1);
    } else {
      setZoom(scaleFactor);
    }
  };

  const setBackground = () => {
    const canvasBackground = new fabric.Rect({
      left: -OFFSET,
      top: -OFFSET,
      fill: 'white',
      width: canvasWidth + OFFSET,
      height: canvasHeight + OFFSET,
      selectable: false,
      evented: false,
      source: 'background',
    } as CustomFabricObject);

    background = canvasBackground as CustomFabricObject;

    canvas?.absolutePan(new fabric.Point(-center.x, -center.y));

    canvas.add(canvasBackground);
    canvas.sendToBack(canvasBackground);
  };

  const resizeCanvas = (width: number, height: number) => {
    console.log('resize');
    if (background) {
      console.log(background);
      background.set({
        width: width + OFFSET,
        height: height + OFFSET,
      });

      setCenter(width, height);
      resetZoom();
    }
  };

  const init = (canvasElementRef: Ref<HTMLCanvasElement | undefined>, _canvasWidth: number, _canvasHeight: number) => {
    if (canvasElementRef.value) {
      canvasEl = canvasElementRef.value;
      canvas = new fabric.Canvas(canvasElementRef.value, {
        fireRightClick: true,
        fireMiddleClick: true,
        stopContextMenu: true,
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
      });

      canvasWidth = _canvasWidth;
      canvasHeight = _canvasHeight;

      setCenter(canvasWidth, canvasHeight);
      setBackground();

      // 기본 스타일 설정
      fabric.Object.prototype.borderColor = '#5771FF';
      fabric.Object.prototype.cornerColor = '#fff';
      fabric.Object.prototype.cornerStrokeColor = '#5771FF';
      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerSize = 8;

      window.addEventListener('keydown', handleKeyDown);

      const updateSelectedObjects = (e: fabric.IEvent) => {
        const selected = e.selected || [];
        if (selected?.length > 1) {
          canvas.discardActiveObject();

          const activeSelection = new fabric.ActiveSelection(
            selected.filter((v) => !v.lockMovementX),
            {
              canvas: canvas,
            }
          );

          if (activeSelection._objects.length) {
            canvas.setActiveObject(activeSelection);
          }
        }
        selectedObjects.value = getActiveObjects();
      };

      // 이벤트 리스너 등록

      // 테두리 추가
      canvas.on('after:render', function () {
        const color = 'rgba(136, 0, 255, 0.147)';
        (canvas as any).contextContainer.strokeStyle = color;

        canvas.forEachObject(function (obj: any) {
          if (obj.source !== 'background') {
            const bound = obj.getBoundingRect();
            (canvas as any).contextContainer.strokeRect(bound.left + 0.5, bound.top + 0.5, bound.width, bound.height);
          }
        });
      });
      // 선택된 오브젝트 가져오기
      canvas.on('selection:created', updateSelectedObjects);
      canvas.on('selection:updated', updateSelectedObjects);
      canvas.on('selection:cleared', () => {
        selectedObjects.value = [];
      });

      canvas.on('mouse:down', function (options) {
        const currentTime = new Date().getTime();
        if (currentTime - lastClickedTime < doubleClickThreshold && options.target) {
          if (options.target.type === 'image') {
            // 이미지 객체가 더블클릭
            isShowImageModal.value = true;
          }
        }
        lastClickedTime = currentTime;
      });

      // 히스토리
      canvas.on('object:modified', saveHistory);
      canvas.on('object:added', saveHistory);
      canvas.on('object:removed', saveHistory);

      // zoom, panning
      canvas.on('mouse:wheel', (opt) => {
        let delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        // if (zoom < 1) zoom = 1

        setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      canvas.on('mouse:down', (opt) => {
        const evt = opt.e;
        if (evt.altKey === true) {
          isDragging = true;
          canvas.setCursor('grabbing');
          lastPosX = evt.clientX;
          lastPosY = evt.clientY;
        }
      });
      canvas.on('mouse:move', (opt) => {
        if (isDragging) {
          const { e } = opt;
          const vpt = canvas.viewportTransform;
          vpt![4] += e.clientX - lastPosX;
          vpt![5] += e.clientY - lastPosY;
          canvas.requestRenderAll();
          lastPosX = e.clientX;
          lastPosY = e.clientY;
        }
      });
      canvas.on('mouse:up', () => {
        if (canvas.viewportTransform) canvas.setViewportTransform(canvas.viewportTransform);

        isDragging = false;
      });
    }

    initialized.value = true;
  };

  const dispose = () => {
    if (canvas) {
      canvas.dispose();
      window.removeEventListener('keydown', handleKeyDown);
    }
  };

  // 히스토리 저장
  const saveHistory = () => {
    if (isHistoryLocked) {
      return;
    }
    const newJson: FabricJson = exportJSON();
    history.push(newJson);
    currentHistoryIndex = history.length - 1;
  };

  // 실행 취소
  const undo = async () => {
    if (currentHistoryIndex < 1 || history.length < 1) {
      return;
    }

    const prevState = history[currentHistoryIndex - 1];
    currentHistoryIndex = currentHistoryIndex - 1;
    await loadJSON(prevState);
  };

  // 다시 실행
  const redo = async () => {
    if (currentHistoryIndex >= history.length - 1) {
      return;
    }

    const nextState = history[currentHistoryIndex + 1];
    currentHistoryIndex = currentHistoryIndex + 1;
    await loadJSON(nextState);
  };

  // 이미지 추가
  const addImg = (url: string) => {
    if (!url || !canvas) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        img.set({ left: 0, top: 0, angle: 0 });
        canvas?.add(img);
      },
      { crossOrigin: 'anonymous' }
    );
  };

  // 텍스트 추가
  const addText = (text: string) => {
    if (!canvas) return;
    const fabricText = new fabric.Textbox(text, {
      editable: true,
      dirty: true,
    });
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
  };

  // 객체 삭제
  const deleteActiveObjects = () => {
    const activeObjects = getActiveObjects();
    if (activeObjects) {
      activeObjects.forEach((object: fabric.Object) => {
        canvas?.remove(object);
      });
      canvas?.discardActiveObject().renderAll();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        deleteActiveObjects();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copy();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        paste();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }
    }
  };

  const getActiveObjects = () => {
    return canvas?.getActiveObjects();
  };

  const getActiveObject = () => {
    return canvas?.getActiveObject();
  };

  const exportJSON = () => {
    const json = canvas?.toJSON([
      'selectable',
      'evented',
      'left',
      'top',
      'scaleX',
      'scaleY',
      'lockMovementX',
      'lockMovementY',
      'lockScalingX',
      'lockScalingY',
      'lockRotation',
      'hasControls',
      'source',
      // "borderColor",
      // "cornerColor",
      // "cornerStrokeColor",
      // "transparentCorners",
      // "cornerSize",
      // "source",
    ]) as FabricJson; // 명시적으로 포함해야 하는 항목

    return json;
  };

  // 읽기 전용으로 캔버스를 불러옴
  const loadTemplateJSON = async (json: FabricJson) => {
    let width;
    let height;
    json.objects.forEach((obj: CustomFabricObject) => {
      if (obj.source === 'background') {
        width = obj.width! - OFFSET;
        height = obj.height! - OFFSET;
      } else {
        obj.selectable = true; // 객체를 선택 가능하게
        obj.lockMovementX = true; // X축 이동 잠금
        obj.lockMovementY = true; // Y축 이동 잠금
        obj.lockScalingX = true; // X축 스케일 조정 잠금
        obj.lockScalingY = true; // Y축 스케일 조정 잠금
        obj.lockRotation = true; // 회전 잠금
        obj.hasControls = false; // 컨트롤 표시
      }
    });

    await loadJSON(json);

    setCenter(width!, height!);
    resetZoom();
    saveHistory();
  };

  const loadJSON = (jsonData: FabricJson) => {
    return new Promise((resolve, reject) => {
      if (!canvas) {
        reject(new Error('Canvas is not initialized.'));
        return;
      }

      isHistoryLocked = true;
      canvas?.loadFromJSON(jsonData, () => {
        canvas.renderAll();
        isHistoryLocked = false;
        resolve(true);
      });
    });
  };

  const closeImageModal = () => {
    isShowImageModal.value = false;
  };

  const replaceImg = (url: string) => {
    const selectedObject = getActiveObject();
    if (selectedObject?.type === 'image') {
      const { left, top, angle, width, height, selectable, lockMovementX, lockMovementY, lockScalingX, lockScalingY, lockRotation, scaleX, scaleY, hasControls } = selectedObject;
      isHistoryLocked = true;
      canvas.remove(selectedObject);

      fabric.Image.fromURL(
        url,
        (newImage) => {
          // const newWidth = newImage.width!;
          // const prevWidth = width!;
          // const newHeight = newImage.height!;
          // const prevHeight = height!;
          // const newScaleX = prevWidth / newWidth;
          // const newScaleY = prevHeight / newHeight;
          // const scaleToFit = Math.max(newScaleX, newScaleY);
          newImage.set({
            left: left,
            top: top,
            scaleX: scaleX,
            scaleY: scaleY,
            angle: angle,
            width,
            height,
            selectable,
            lockMovementX,
            lockMovementY,
            lockScalingX,
            lockScalingY,
            lockRotation,
            hasControls,
            originX: 'left',
            originY: 'top',
            crossOrigin: 'anonymous',
          });

          isHistoryLocked = false;

          canvas.add(newImage);
          canvas.setActiveObject(newImage);
          canvas.renderAll();
        },
        { crossOrigin: 'anonymous' }
      );
    }
  };

  const copy = () => {
    canvas?.getActiveObject()?.clone((cloned: fabric.Object) => {
      clipboard = cloned;
    });
  };

  const paste = () => {
    if (!clipboard) return;
    clipboard.clone((clonedObj: any) => {
      canvas.discardActiveObject();
      if (!clonedObj) return;
      clonedObj.set({
        left: clonedObj.left! + 10,
        top: clonedObj.top! + 10,
        evented: true,
        ...clonedObj,
      });
      if (clonedObj.type === 'activeSelection') {
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function (obj: any) {
          canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      clipboard!.top! += 10;
      clipboard!.left! += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  };

  const exportImage = () => {
    const tempCanvas = new fabric.Canvas(null);
    const jsonData = exportJSON();

    jsonData.objects.forEach((obj: any) => {
      obj.crossOrigin = 'anonymous';
    });

    tempCanvas.setWidth(canvasWidth);
    tempCanvas.setHeight(canvasHeight);

    tempCanvas.loadFromJSON(jsonData, () => {
      tempCanvas.forEachObject(
        (
          obj: fabric.Object & {
            left?: number;
            top?: number;
            scaleX?: number;
            scaleY?: number;
          }
        ) => {
          obj.setCoords();
        }
      );

      const url = tempCanvas.toDataURL({
        format: 'jpeg',
        quality: 1,
        enableRetinaScaling: devicePixelRatio >= 2,
      });

      const link = document.createElement('a');
      link.href = url;

      link.download = 'download-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return {
    init,
    initialized,
    dispose,
    addImg,
    addText,
    deleteActiveObjects,
    selectedObjects,
    exportJSON,
    loadJSON,
    loadTemplateJSON,
    closeImageModal,
    isShowImageModal,
    replaceImg,
    redo,
    undo,
    currentZoom,
    exportImage,
    setZoom,
    resetZoom,
    resizeCanvas,
  };
}
