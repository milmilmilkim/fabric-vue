import { fabric } from "fabric";

class FabricCanvas {
  private canvas: fabric.Canvas | undefined = undefined;

  constructor(targetElement: HTMLCanvasElement) {
    fabric.Textbox.prototype.insertNewStyleBlock = function () {};
    fabric.Object.prototype.borderColor = "#5771FF";
    fabric.Object.prototype.cornerColor = "#fff";
    fabric.Object.prototype.cornerStrokeColor = "#5771FF";
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerSize = 8;
    fabric.Textbox.prototype.setControlsVisibility({
      mt: false,
      mb: false,
    });

    this.canvas = new fabric.Canvas(targetElement, {
      fireRightClick: true,
      fireMiddleClick: true,
      stopContextMenu: true,
    });
  }

  public addText(text: string) {
    const fabricText = new fabric.Textbox(text, {
      editable: true,
      dirty: true,
    });

    fabricText.setControlsVisibility({
      mt: false, // 중앙 상단 컨트롤 숨김
      mb: false, // 중앙 하단 컨트롤 숨김
    });

    this.canvas?.add(fabricText);
    this.canvas?.setActiveObject(fabricText);
  }

  addImg(url: string) {
    console.log("이미지 추가");
    if (!url) return;
    fabric.Image.fromURL(
      url,
      (img) => {
        img.set({
          left: 0,
          top: 0,
          angle: 0,
        });

        this.canvas?.add(img);
      },
      { crossOrigin: "anonymous" }
    );
  }

  deleteActiveObject() {
    const activeObjects = this.canvas?.getActiveObjects();

    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((object) => {
        this.canvas?.remove(object);
      });

      this.canvas?.discardActiveObject();
      this.canvas?.renderAll();
    }
  }
}

export default FabricCanvas;
