<script lang="ts">
  import type { SpaceObject } from "../space-data/schema/schema";
  // import type { View } from "./helpers/View";
  import type { PinParams } from "./helpers/interfaces";
  import TopMenu from "./components/TopMenu.svelte";
  import InfoPop from "./components/InfoPop.svelte";
  import StarsBg from "./components/webgl/StarsBG.svelte";
  import PlanetFG from "./components/PlanetFG.svelte";

  import { onMount } from "svelte";
  import { ViewportService } from "./services/ViewportService";
  import type { Point } from "./helpers/Point";
  import DroppedPin from "./components/DroppedPin.svelte";
import { QueryService } from "./services/QueryService";

  // let currentView: View | null = null;

  let pinPosRels: PinParams[] = [];

  let getPositionByRelative = (a:number,b:number)=>{return{x:a,y:b}};

  onMount(() => {
    ViewportService.getAsyncInstance().then(vs=>{
      vs.getViewportStore().subscribe(() => {
      pinPosRels = []; // removes the pin
    });
    })
    
  });

  let isChooseCms =
    location.search.includes("chooseToCms=true") && window.opener;

  async function putPin(e: MouseEvent) {
    const relx = e.clientX / window.innerWidth;
    const rely = e.clientY / window.innerHeight;
    const { x, y } = await ViewportService.getAsyncInstance().then(vs=>vs.getPositionByRelative(relx,rely))
    const  closests = await QueryService.getAsyncInstance().then(
      qs=>qs.getClosest(x,y,3)
    )
    pinPosRels = [{ x, y, relx, rely, isChooseCms, closests }];
  }
</script>

<svelte:window
  on:contextmenu|capture|stopPropagation|preventDefault={() => false}
  on:dblclick={putPin}
  on:click={()=>pinPosRels =[]}
/>

<main >
  {#if isChooseCms}
    <div class="choose-msg">
      Double click to choose position or close tab to cancel
    </div>
  {/if}
  {#each pinPosRels as pinPosRel (JSON.stringify(pinPosRel))}
    <DroppedPin pinparams={pinPosRel} />
  {/each}
  <TopMenu />
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
    border-radius: 10px;
    padding: 10px;
    position: absolute;
    margin: auto;
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
    color: var(--highlight-plus, white);
  background-color: var(--box, gray);
  }
 
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
