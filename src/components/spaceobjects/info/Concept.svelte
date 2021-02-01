<script lang="ts">
  import type { SpaceObject } from "../../../../space-data/schema/schema";
  import Common from "./Common.svelte";

  export let so: SpaceObject;
</script>

<style>
    
</style>
<Common {so} />
