<script context="module" type="ts">
  // context=module means this is added once
  let svgGrads = "<svg>";

  for (const ptype of ["concept", "product"]) {
    svgGrads += `<radialGradient id="grad-${ptype}" cx="25%" cy="25%" r="60%">
      <stop offset="0%"
        style="stop-color:var(--planet-${ptype}-hl, white);stop-opacity:1"
      />
      <stop offset="100%"
        style="stop-color:var(--planet-${ptype}-dark, gray);stop-opacity:1"
      />
    </radialGradient>`;
  }
  svgGrads += "</svg>";
  let newElement = document.createElement("div");
  newElement.setAttribute("style", "visbility:hidden;position:absolute");
  newElement.innerHTML = svgGrads;
  document.body.appendChild(newElement);
</script>

<script lang="ts">
  import type { SpaceObject } from "../../../../space-data/schema/schema";
  import { createEventDispatcher } from "svelte";
  import type { Point } from "../../../helpers/Point";

  export let so: SpaceObject & { position: Point };

  export let isSelected: boolean;
  const dispatch = createEventDispatcher();

  export let size = 0.5;
</script>

<g
  class="planet {so.type}"
  on:click={() => dispatch("select")}
  style="--size-ref: {size * 0.1};--size-ref3: {size *
    0.3};--size-ref3pi: {size * 0.6}"
>
  <circle
    class="{so.type}-p"
    cx={so.position.x}
    cy={so.position.y}
    r={size}
    fill="url(#grad-{so.type})"
  />
  {#if isSelected}
    <circle
      class="{so.type}-ci sel-dash"
      cx={so.position.x}
      cy={so.position.y}
      r={size * 1.25}
      stroke="var(--planet-{so.type}-dark)"
      stroke-dasharray="{size * 0.3} {size * 0.3}"
    />
  {/if}
  <text
    x={so.position.x}
    y={so.position.y - size * 1.5}
    font-size={size}
    text-anchor="middle">{so.title}</text
  >
</g>

<style>
  .sel-dash {
    stroke-linecap: round;
    fill: transparent;
    animation-name: carousel;
    animation: carousel 20s linear 0s infinite;
    stroke-width: var(--size-ref);
    transform-box: fill-box;
    transform-origin: center;
  }
  @keyframes carousel {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  g.concept text {
    fill: var(--planet-concept-dark);
  }
  g.concept:hover text {
    fill: var(--planet-concept-hl);
  }

  g.product text {
    fill: var(--planet-product-dark);
  }
  g.product:hover text {
    fill: var(--planet-product-hl);
  }
</style>
