<script lang="ts">
  import type { SpaceObject } from "../space-data/schema/schema";
  import StarsBg from "./components/webgl/StarsBG.svelte";
  import { viewportable } from "./actions/viewportable";
  import type { View } from "./helpers/View";
  import Infotab from "./components/Infotab.svelte";
  import { onMount } from "svelte/internal";
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
    for (let [uid,so] of Object.entries(spaceObjs)) {
      ret.push([so, SpaceObjectToSvgComponent(so),uid]);
    }

    return ret;
  }

  function viewchange(viewChange: CustomEvent<View>) {
    currentView = viewChange.detail;
  }
  function setSelected(sel: any) {
    console.log(sel)
    selectedObject = sel;
  }

  onMount(() => {});
</script>

<svelte:window
  on:contextmenu|capture|stopPropagation|preventDefault={() => false}
/>
<main use:viewportable on:viewchange={viewchange}>
  {#if currentView && Object.keys(spaceObjects).length}
    <StarsBg view={currentView} />
    <svg
      class="svgboard"
      viewBox={currentView.toSvgString()}
      on:click|self={() => (selectedObject = null)}>
      {#each getObjectsInView(spaceObjects, currentView) as so (so[2])}
        <g on:click={()=>setSelected(so[0])}>
        <svelte:component  so={so[0]} this={so[1]} view={currentView} />
      </g>
      {/each}
    </svg>
    <Infotab selected={selectedObject} />
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
