<script lang="ts">
  import type { SpaceObject } from "../../space-data/schema/schema";
  import type { View } from "../helpers/View";
  import { scale } from "svelte/transition";
  import { ViewportService } from "../services/ViewportService";
  import type { ServiceType } from "../services/Service";
  import { SelectionManager } from "../services/SelectionManager";
  import { createEventDispatcher } from "svelte";
  import { SpaceObjectToInfoTemplate } from "./spaceobjects/mapping";

  let so: SpaceObject | null = null;

  SelectionManager.getInstance().selectedStore.subscribe((x) => (so = x))
  $: selectedComponent = so && SpaceObjectToInfoTemplate(so);

  let viewportService: ServiceType<typeof ViewportService> | undefined;
  let currentView: View | undefined;

  const dispatch = createEventDispatcher();

  // $: console.log(selected)
  $: isHorizontal = currentView && currentView.width > currentView.height;

  $: selectionPos = (so && "position" in so && so.position) || null;

  $: if (viewportService && isHorizontal !== undefined)
    viewportService.updateShift(selectionPos, isHorizontal);

  ViewportService.getAsyncInstance().then((s) => {
    viewportService = s;
    viewportService.getViewportStore().subscribe((v) => (currentView = v));
  });
</script>

{#if so}
  <div
    class="info-menu"
    class:horizontal={isHorizontal}
    class:vertical={!isHorizontal}
    transition:scale={{ duration: 200, start: 0.9, opacity: 0 }}
  >
    <div class="closer" on:click={() => dispatch("close")} />
    {#if selectedComponent}
      <svelte:component this={selectedComponent} {so} />
    {/if}
  </div>
{/if}

<style>
  .info-menu {
    position: absolute;
    display: flex;
    flex-direction: column;
    z-index: 10;
    background: #ffffffc2;
    box-shadow: 0px 0px 10px #ffffff8a, inset 0px 0px 30px #ffffff8a;
    border: 3px solid white;
    padding: 0.5rem 2rem;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .info-menu.horizontal {
    width: calc(50vw - 5vh);
    height: 90vh;
    top: 5vh;
    left: 50vw;
  }
  .info-menu.vertical {
    width: 90vw;
    height: calc(50vh - 5vw);
    top: 50vh;
    left: 5vw;
  }
</style>
