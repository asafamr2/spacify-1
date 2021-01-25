<script lang="ts">
  import type { Concept } from "../../../space-data/schema/schema";
  import type { View } from "../../helpers/View";
  import { bandpass } from "../../helpers/maff";

  export let so: Concept;
  export let view: View;

  let size = 0.5;

  let opacity = bandpass([0, 0.001, 0.2, 0.6], size / view.width);
  
</script>

<circle
  class="{so.type}"
  style="opacity:{opacity}"
  cx={so.position.x}
  cy={so.position.y}
  r={size}
/>
