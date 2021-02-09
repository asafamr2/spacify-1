<script lang="ts">
  import { ViewToSvgBox } from "../helpers/View";
  import type { View } from "../helpers/View";
  import { ViewportService } from "../services/ViewportService";
  import { SelectionManager } from "../services/SelectionManager";
  import type { SpaceObject } from "../../space-data/schema/schema";
  import { SpaceObjectToSvgComponent } from "./spaceobjects/mapping";
  import { throttle } from "../helpers/functional";
  import { QueryService } from "../services/QueryService";
import { SafelyUndefined } from "../helpers/interfaces";
import { onMount } from "svelte";
  const selectionManager = SelectionManager.getInstance();
  const selStore = selectionManager.selectedStore;
  let spaceObjectsInView: [
    SpaceObject,
    ReturnType<typeof SpaceObjectToSvgComponent>
  ][] = [];
  let updating = false;
  const throttledUpdateView = throttle((view: View) => {
    if (updating) return;
    updating = true;
    QueryService.getAsyncInstance()
      .then((qs) => {
        spaceObjectsInView = qs
          .getObjectsInBox({
            minX: view.x - view.width * 2,
            maxX: view.x + view.width * 3,
            minY: view.y - view.height * 2,
            maxY: view.y + view.height * 3,
          })
          .map((x) => [x, SpaceObjectToSvgComponent(x)]);
      })
      .finally(() => (updating = false));
  }, 100);

  let viewController=SafelyUndefined<HTMLElement>();
    onMount(()=>{
      ViewportService.build({node:viewController});
    })
  

  let currentView: View;
  ViewportService.getAsyncInstance().then((viewportService) =>
    viewportService.getViewportStore().subscribe((view) => {
      throttledUpdateView(view);
      currentView = view;
    })
  );
</script>




<div class='main' bind:this={viewController}>
  {#if currentView}
    <svg
      class="svgboard"
      viewBox={ViewToSvgBox(currentView)}
      on:click|self={() => selectionManager.unset()}
    >
      {#each spaceObjectsInView as so (so[0].category + "/" + so[0].uid)}
        <svelte:component
          this={so[1]}
          so={so[0]}
          isSelected={$selStore === so[0]}
          on:select={() => selectionManager.set(so[0])}
        />
      {/each}
    </svg>
  {/if}
</div>

<style>
  
  .main{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .svgboard {
    font-family: monospace;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
</style>
