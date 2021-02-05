<script lang="ts">
  import { ViewToSvgBox } from "../helpers/View";
  import type { View } from "../helpers/View";
  import { SpatialIndexService } from "../services/SpatialIndexService";
  import type { SpaceData } from "../../space-data/schema/data";
  import { ViewportService } from "../services/ViewportService";

  import { SelectionManager } from "../services/SelectionManager";
  import type { SpaceObject } from "../../space-data/schema/schema";
  import { SpaceObjectToSvgComponent } from "./spaceobjects/mapping";
  const selectionManager = SelectionManager.getService();

  let spaceObjects: { [uid: string]: SpaceObject } = {};
  let currentView: View;
  ViewportService.getService().then((viewportService) =>
    viewportService.getViewportStore().subscribe((view) => (currentView = view))
  );

  fetch(`build/front_content.json`)
    .then((r) => r.json())
    .then((json: SpaceData) => {
      SpatialIndexService.getService().setPoints(json.spatial);
      spaceObjects = json.objects;
    });

  function getObjectsInView(
    spaceObjs: { [uid: string]: SpaceObject },
    _view: View
  ) {
    let ret: [SpaceObject, any, string][] = [];
    for (let [uid, so] of Object.entries(spaceObjs)) {
      ret.push([so, SpaceObjectToSvgComponent(so), uid]);
    }
    return ret;
  }
</script>

{#if currentView}
<svg
  class="svgboard"
  viewBox={ViewToSvgBox(currentView)}
  on:click|self={() => selectionManager.unset()}
>
  {#each getObjectsInView(spaceObjects, currentView) as so (so[2])}
    <svelte:component
      this={so[1]}
      so={so[0]}
      view={currentView}
      on:select={() => selectionManager.set(so[0])}
    />
  {/each}
</svg>
{/if}
<style>
  .svgboard {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
</style>
