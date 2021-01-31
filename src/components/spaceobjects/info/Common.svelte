<script lang="ts">
import type { SpaceObject } from "../../../../space-data/schema/schema";


    export let so:SpaceObject;
    $:console.log(so)
</script>


<style>

</style>

<div>
    <h1>{so.title}</h1>

</div>