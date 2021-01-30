import { spring } from "svelte/motion";
import { writable } from "svelte/store";
import { clamp } from "../helpers/maff";
import type { View } from "../helpers/View";
import { AsyncService } from "./Service";
import Hammer from "hammerjs";

interface ViewFreeDims {
  x: number;
  y: number;
  width: number;
}
const viewLimits: Record<string, [number, number]> = {
  x: [-100, 1000],
  y: [-100, 1000],
  width: [10, 1000],
};

const startView = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
};

// just for unexported return types
abstract class Unexported<T> {
  Spring = spring<T>();
  Writable = writable<T>({} as T);
}

export class ViewportService extends AsyncService {
  vn: ViewportNode;
  viewportStore: Unexported<View>["Writable"];
  protected constructor(
    vn: ViewportNode,
    viewportStore: Unexported<View>["Writable"]
  ) {
    super();
    this.vn = vn;
    this.viewportStore = viewportStore;
  }

  public static Init(node: HTMLElement) {
    const vs = writable<View>(startView);
    const vn = new ViewportNode(node, vs, startView);
    return new ViewportService(vn, vs);
  }

  public getViewportStore(this: this) {
    return this.viewportStore;
  }
}

type Cleanup = () => void;

class ViewportNode {
  //   protected viewSpring: ViewSpring;
  protected nodeBoundingRect: DOMRect;
  protected widthHeightRatio: number;
  protected unsubscribeCurrent: () => void = () => {};
  protected viewSpring: Unexported<ViewFreeDims>["Spring"];
  protected cleanups: Cleanup[] = [];
  public constructor(
    protected node: HTMLElement,
    protected viewportStore: Unexported<View>["Writable"],
    protected currentView: View
  ) {
    this.nodeBoundingRect = node.getBoundingClientRect();
    this.widthHeightRatio =
      this.nodeBoundingRect.width / this.nodeBoundingRect.height;
    this.viewSpring = spring<ViewFreeDims>(
      {
        x: currentView.x,
        y: currentView.y,
        width: currentView.width,
      },
      { stiffness: 0.2, damping: 0.7 }
    );
    const unsubscribeCurrent = this.viewSpring.subscribe(({ x, y, width }) => {
      this.currentView = { x, y, width, height: width / this.widthHeightRatio };
      this.viewportStore.set(this.currentView);
    });
    this.cleanups.push(unsubscribeCurrent);
    this.setupHammer();
    this.registerEvents();
  }
  public cleanup(this: this) {
    for (const cp of this.cleanups) {
      cp();
    }
  }
  protected registerEvents(this: this) {
    const lwheel = (e: WheelEvent) => this.onWheel(e);
    const lresize = this.onResize.bind(this);
    this.node.addEventListener("wheel", lwheel);
    this.node.addEventListener("resize", lresize);
    window.addEventListener("resize", lresize);
    this.cleanups.push(() => {
      this.node.removeEventListener("wheel", lwheel);
      this.node.removeEventListener("resize", lresize);
      window.removeEventListener("resize", lresize);
    });
  }

  protected setViewSmooth(this: this, v: ViewFreeDims) {
    if (
      v.x < viewLimits.x[0] ||
      v.x + v.width > viewLimits.x[1] ||
      v.y < viewLimits.y[0] ||
      v.y + v.width * 4 > viewLimits.y[1]
    ) {
      return;
    }
    void this.viewSpring.set(v, { soft: 0.05 });
  }

  protected getScaledView(
    this: this,
    clientX: number,
    clientY: number,
    scale: number
  ): View {
    const rect = this.nodeBoundingRect;
    const relPosX = (clientX - rect.left) / rect.width;
    const relPosY = (clientY - rect.top) / rect.height;
    const newWidth = clamp(this.currentView.width * scale, 10, 1000);
    const diff = newWidth - this.currentView.width;
    return {
      x: this.currentView.x - relPosX * diff,
      y: this.currentView.y - (relPosY * diff) / this.widthHeightRatio,
      width: newWidth,
      height: newWidth / this.widthHeightRatio,
    };
  }

  protected setupHammer(this: this) {
    const mc = new Hammer(this.node);
    this.cleanups.push(() => mc.destroy());
    const pinch = new Hammer.Pinch();
    const pan = new Hammer.Pan();
    // pinch.recognizeWith(pan);
    // for now they are mutually exclusive
    mc.add([pinch, pan]);

    let beforeMoveView: View;
    let pinchCenter: HammerPoint | null = null;
    mc.on("panstart pinchstart", (ev) => {
      pinch.set({ enable: ev.type === "pinchstart" });
      pan.set({ enable: ev.type === "panstart" });
      beforeMoveView = this.currentView;
      pinchCenter = ev.center;
    });
    mc.on("panend pinchend", () => {
      pinch.set({ enable: true });
      pan.set({ enable: true });
    });
    mc.on("panmove pinchmove", (ev) => {
      if (!beforeMoveView) return;
      let pxToUnit = beforeMoveView.width / this.nodeBoundingRect.width;
      if (ev.type === "pinchmove") {
        pxToUnit = 0;
      }
      const scaled =
        Math.abs(ev.scale - 1) > 1e-2
          ? this.getScaledView(pinchCenter!.x, pinchCenter!.y, 1 / ev.scale)
          : beforeMoveView;

      this.setViewSmooth({
        x: scaled.x - ev.deltaX * pxToUnit,
        y: scaled.y - ev.deltaY * pxToUnit,
        width: scaled.width,
      });
    });
  }
  protected onResize(this: this) {
    this.nodeBoundingRect = this.node.getBoundingClientRect();
    this.widthHeightRatio =
      this.nodeBoundingRect.width / this.nodeBoundingRect.height;
    this.setViewSmooth({
      x: this.currentView.x,
      y: this.currentView.y,
      width: this.currentView.width,
    });
  }
  protected onWheel(this: this, event: WheelEvent) {
    let factor = 1;
    if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
      factor = 35;
    } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
      factor = 22 * 35;
    }
    // const relPosX = event.offsetX /event.

    const deltaYPixels = event.deltaY * factor;
    const zoomFactor = Math.pow(1.005, deltaYPixels);
    const scaledView = this.getScaledView(
      event.clientX,
      event.clientY,
      zoomFactor
    );
    this.setViewSmooth({
      x: scaledView.x, //lastView.x - diff * relPosX,
      y: scaledView.y, //
      width: scaledView.width,
    });
    event.preventDefault();
  }
}
