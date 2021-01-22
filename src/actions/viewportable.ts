import Hammer from "hammerjs";
import { spring } from "svelte/motion";
import { View } from "../helpers/View";

export function viewportable(node: HTMLElement) {
  let widthHeightRatio: number;
  let widthPx: number;
  let lastView: View = new View(0, 0, 100, 100);

  const viewSpring = spring(
    { x: 0, y: 0, width: 100 },
    { stiffness: 0.3, damping: 0.6 }
  );

  viewSpring.subscribe(({ x, y, width }) => {
    const newView = new View(x, y, width, width / widthHeightRatio);
    lastView = newView;
    node.dispatchEvent(
      new CustomEvent<View>("viewchange", {
        detail: newView,
      })
    );
  });

  function getScaledView(
    clientX: number,
    clientY: number,
    view: View,
    scale: number
  ): View {
    const rect = node.getBoundingClientRect();
    const relPosX = (clientX - rect.left) / rect.width;
    const relPosY = (clientY - rect.top) / rect.height;
    const newWidth = view.width * scale;
    const diff = newWidth - view.width;
    return new View(
      view.x - relPosX * diff,
      view.y - (relPosY * diff) / widthHeightRatio,
      newWidth,
      newWidth / widthHeightRatio
    );
  }

  setTimeout(onResize);

  const mc = new Hammer(node);
  const pinch = new Hammer.Pinch();
  const pan = new Hammer.Pan();
  // pinch.recognizeWith(pan);
  //for now they are mutually exclusive
  mc.add([pinch, pan]);

  let beforeMoveView = lastView;
  let pinchCenter: HammerPoint|null = null;
  mc.on("panstart pinchstart", (ev) => {
    pinch.set({ enable: ev.type === "pinchstart" });
    pan.set({ enable: ev.type === "panstart" });
    beforeMoveView = lastView;
    pinchCenter = ev.center;
  });
  mc.on("panend pinchend", (ev) => {
    pinch.set({ enable: true });
    pan.set({ enable: true });
  });
  mc.on("panmove pinchmove", (ev) => {
    let pxToUnit = beforeMoveView.width / widthPx;
    if (ev.type === "pinchmove") {
      pxToUnit = 0;
    }
    const scaled =
      Math.abs(ev.scale - 1) > 1e-2
        ? getScaledView(
            pinchCenter!.x,
            pinchCenter!.y,
            beforeMoveView,
            1 / ev.scale
          )
        : beforeMoveView;

    void viewSpring.update(() => {
      return {
        x: scaled.x - ev.deltaX * pxToUnit,
        y: scaled.y - ev.deltaY * pxToUnit,
        width: scaled.width,
      };
    });
  });

  function onResize() {
    // document.documentElement.style.fontSize = `${2/window.devicePixelRatio*18}px`
    widthPx = node.clientWidth;
    widthHeightRatio = node.clientWidth / node.clientHeight;
    void viewSpring.set({
      x: lastView.x,
      y: lastView.y,
      width: lastView.width,
    });
  }

  function onWheel(event: WheelEvent) {
    let factor = 1;
    if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
      factor = 35;
    } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
      factor = 22 * 35;
    }
    // const relPosX = event.offsetX /event.

    const deltaYPixels = event.deltaY * factor;
    const zoomFactor = Math.pow(1.005, deltaYPixels);
    const scaledView = getScaledView(
      event.clientX,
      event.clientY,
      lastView,
      zoomFactor
    );

    void viewSpring.set({
      x: scaledView.x, //lastView.x - diff * relPosX,
      y: scaledView.y, //
      width: scaledView.width,
    });
    event.preventDefault();
  }

  node.addEventListener("wheel", onWheel);
  window.addEventListener("resize", onResize);
  node.addEventListener("resize", onResize);

  return {
    destroy: () => {
      mc.destroy();
      node.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      node.removeEventListener("resize", onResize);
    },
  };
}
