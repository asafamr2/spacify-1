<script lang="ts">
  import type { SpaceObject } from "../space-data/schema/schema";
  import type { View } from "./helpers/View";
  import type { PinParams } from "./helpers/interfaces";
  import InfoPop from "./components/InfoPop.svelte";
  import StarsBg from "./components/webgl/StarsBG.svelte";
  import PlanetFG from "./components/PlanetFG.svelte";

  import { onMount } from "svelte";
  import { ViewportService } from "./services/ViewportService";
  import type { Point } from "./helpers/Point";
  import DroppedPin from "./components/DroppedPin.svelte";

  let mainElement: HTMLElement;
  let currentView: View | null = null;

  let pinPosRels: Point[] = [];

  let viewportService: ViewportService;

  onMount(async () => {
    viewportService = ViewportService.Init(mainElement);
    viewportService.getViewportStore().subscribe((v) => {
      pinPosRels = [];
      currentView = v;
    });
  });

  let isChooseCms =
    location.search.includes("chooseToCms=true") && window.opener;

  function getPinParams(pinPosRel: Point): PinParams {
    const closests: SpaceObject[] = [];
    if (!pinPosRel)
      return { x: 0, y: 0, relx: 0, rely: 0, isChooseCms, closests };
    const relx = pinPosRel.x;
    const rely = pinPosRel.y;
    const { x, y } = viewportService.getPositionByRelative(relx, rely);


    return { x, y, relx, rely, isChooseCms, closests };
  }
  function doubleClick(e: MouseEvent) {
    const relx = e.clientX / window.innerWidth;
    const rely = e.clientY / window.innerHeight;
    pinPosRels = [{ x: relx, y: rely }];
  }
</script>

<svelte:window
  on:contextmenu|capture|stopPropagation|preventDefault={() => false}
  on:dblclick={doubleClick}
/>

<main bind:this={mainElement}>
    {#each pinPosRels as pinPosRel (JSON.stringify(pinPosRel))}
      <DroppedPin pinparams={getPinParams(pinPosRel)} />
    {/each}
    {#if isChooseCms}
      <div class="choose-msg">
        Double click to choose position or close tab to cancel
      </div>
    {/if}
    <StarsBg />
    <PlanetFG />
    <InfoPop />
</main>

<style>
  main {
    margin: 0 auto;
    width: 100%;
    height: 100%;
    display: block;
  }
  .choose-msg {
    z-index: 20;
    color: var(--highlight-plus, white);
    background-color: var(--box, gray);
    border-radius: 10px;
    padding: 10px;
    position: absolute;
    margin: auto;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
  }



  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
