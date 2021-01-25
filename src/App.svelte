<script lang="ts">
  import type { SpaceObject } from "../space-data/schema/schema";
  import StarsBg from "./components/webgl/StarsBG.svelte";
  import { viewportable } from "./actions/viewportable";
  import type { View } from "./helpers/View";
  import Infotab from "./components/Infotab.svelte";
  import { onMount } from "svelte/internal";
  import { isInspect } from "./stores/main";
  import { SpaceObjectToSvgComponent } from "./components/spaceobjects/mapping";

  let currentView: View | null = null;
  let selectedObject: SpaceObject | null = null;
  let spaceObjects: { [uid: string]: SpaceObject } = {};

  fetch(`build/space_objects.json`)
    .then((r) => r.json())
    .then((json) => (spaceObjects = json));

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
      isInspect.update((v) => !v);
    }
  }
  function viewchange(viewChange: CustomEvent<View>) {
    currentView = viewChange.detail;
  }
  function setSelected(sel: any) {
    selectedObject = sel;
  }

  onMount(() => {});
</script>

<svelte:window
  on:contextmenu|capture|stopPropagation|preventDefault={() => false}
  on:keydown={keyPressed}
/>
<main use:viewportable on:viewchange={viewchange}>
  {#if currentView && Object.keys(spaceObjects).length}
    <StarsBg view={currentView} />
    <svg
      class="svgboard"
      viewBox={currentView.toSvgString()}
      on:click|self={() => (selectedObject = null)}>
      {#each getObjectsInView(spaceObjects, currentView) as so (so[2])}
        <g on:click={() => setSelected(so[0])}>
          <svelte:component this={so[1]} so={so[0]} view={currentView} />
        </g>
      {/each}
    </svg>
    <Infotab selected={selectedObject} />
    {#if $isInspect}
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
