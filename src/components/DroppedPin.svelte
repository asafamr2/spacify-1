<svelte:options immutable={true} />

<script lang="ts">
import { scale } from "svelte/transition";

  import type { PinParams } from "../helpers/interfaces";

  export let pinparams: PinParams;
  const { x, y, relx, rely, closests, isChooseCms } = pinparams;
  function choose() {
    (window as any)._viewportPosition = { x, y };
    window.close();
  }
  function create(what: "concept" | "product") {
    window.open(
      `/admin/#/collections/${what}/new#x=${x.toFixed(3)}&y=${y.toFixed(3)}`
    );
  }
</script>

<div transition:scale={{duration:100}} class="pin" style="left: {relx * 100}%; top: {rely * 100}%">
  <div>X,Y: ({x.toFixed(2)}, {y.toFixed(2)})</div>
  <div>
    Closests objects:
    <ul>
      {#each closests as so}
        {so.uid}/{so.uid}
      {/each}
    </ul>
  </div>
  {#if isChooseCms}
    <button class="action" on:click={() => choose()}
      >Choose position and return to CMS</button
    >
  {:else}
    <div>
      <button class="action" on:click={() => create("concept")}
        >Put a new Concept here</button
      >
    </div>
    <div>
      <button class="action" on:click={() => create("product")}
        >Put a new Product here</button
      >
    </div>
  {/if}
</div>

<style>
  .pin {
    position: absolute;
    background-color: var(--panel, white);
    color: var(--text-shout, rgb(0, 0, 0));
    z-index: 30;
    transform: translate(-30px, -120%);
    padding: 10px;
  }
  .pin::after {
    content: "";
    display: block;
    position: absolute;
    background-color: transparent;
    width: 0;
    height: 0;
    margin-left: 0;
    border-left: 21px solid transparent;
    border-right: 21px solid transparent;
    border-top: 32px solid var(--panel, white);
  }
</style>
