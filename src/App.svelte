<script lang="ts">
  import type { SpaceObject } from "../space-data/schema/schema";
  import type { View } from "./helpers/View";
  import { ViewToSvgBox } from "./helpers/View";
  import InfoPop from "./components/InfoPop.svelte";
  import StarsBg from "./components/webgl/StarsBG.svelte";

  import { onMount } from "svelte/internal";
  import { isInspectStore } from "./stores/main";
  import { SpaceObjectToSvgComponent } from "./components/spaceobjects/mapping";
  import { SpatialIndexService } from "./services/SpatialIndexService";
  import type { SpaceData } from "../space-data/schema/data";
  import { ViewportService} from "./services/ViewportService";


  let mainElement:HTMLElement;
  let currentView:View | undefined ;

  onMount(async () => {
    const viewportService = ViewportService.Init(mainElement);
    viewportService.getViewportStore().subscribe(v=>currentView =v);
  })

  let selectedObject: SpaceObject | null = null;
  let spaceObjects: { [uid: string]: SpaceObject } = {};

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
    let ret = [];
    for (let [uid, so] of Object.entries(spaceObjs)) {
      ret.push([so, SpaceObjectToSvgComponent(so), uid]);
    }

    return ret;
  }
  function keyPressed(event: KeyboardEvent) {
    if (event.code == "KeyI" && event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      isInspectStore.update((v) => !v);
    }
  }

  function setSelected(sel: any) {
    selectedObject = sel;
  }

</script>

<svelte:window
  on:contextmenu|capture|stopPropagation|preventDefault={() => false}
  on:keydown={keyPressed}
/>
<main bind:this={mainElement}>
  {#if currentView && Object.keys(spaceObjects).length}
    <StarsBg />
    <svg
      class="svgboard"
      viewBox={ViewToSvgBox(currentView)}
      on:click|self={() => (selectedObject = null)}
    >
      {#each getObjectsInView(spaceObjects, currentView) as so (so[2])}
          <svelte:component this={so[1]} so={so[0]} view={currentView} on:select={() => setSelected(so[0])}/>
      {/each}
    </svg>
    <InfoPop so={selectedObject} on:close={() => (selectedObject = null)}/>
    {#if $isInspectStore}
      <div class="cur cursor-hor" />
      <div class="cur cursor-ver" />
      <div class="inspector">
        <div>Viewport center:</div>
        <div>
          ({(currentView.x + currentView.width / 2).toFixed(2)},{(
            currentView.y +
            currentView.height / 2
          ).toFixed(2)})
        </div>

        <div>Viewport width:</div>
        <div>
          {currentView.width.toFixed(2)}
        </div>

        <div>Viewport height:</div>
        <div>
          {currentView.height.toFixed(2)}
        </div>
      </div>
    {/if}
  {/if}
</main>

<style>
  main {
    margin: 0 auto;
    width: 100%;
    height: 100%;
    display: block;
  }
  /* svg {
		/* background-color: #402641; 
  } */
  .inspector div {
    grid-column: span 1;
  }
  .cur {
    position: absolute;
    margin: 0 auto;
    background-color: white;
    opacity: 0.4;
    display: block;
    top: 50%;
    left: 50%;
    height: 5vw;
    width: 5vw;
    translate: -50% -50%;
  }
  .cur.cursor-hor {
    height: 1px;
  }
  .cur.cursor-ver {
    width: 1px;
  }

  .inspector {
    z-index: 10;
    padding: 5px;
    background-color: rgba(255, 255, 255, 0.568);
    color: black;
    position: absolute;
    display: grid;
    bottom: 0;
    right: 0;
    grid-template-columns: 3fr 2fr;
  }
  .svgboard {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
