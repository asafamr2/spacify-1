<script lang="ts">
  import type { Concept, SpaceObject } from "../../../../space-data/schema/schema";
  import type { View } from "../../../helpers/View";
  import { bandpass } from "../../../helpers/maff";
import { createEventDispatcher } from "svelte";
import type { Point } from "../../../helpers/Point";

  export let so: SpaceObject & {position:Point};
  export let view: View;

  const dispatch = createEventDispatcher();
  
  let size = 0.5;

  let opacity = bandpass([0, 0.001, 0.2, 0.6], size / view.width);
  
  let color = `var(--planet-${so.type},red)`
</script>

<circle
  on:click={()=> dispatch('select')}
  class="{so.type}"
  opacity={opacity}
  cx={so.position.x}
  cy={so.position.y} 
  r={size}
  style="fill:{color}"
/>
