<script lang="ts">
  import type { SpaceObject } from "../../../../space-data/schema/schema";
  import { QueryService } from "../../../services/QueryService";
  import Loader from "../../Loader.svelte";
  export let so: SpaceObject;

  async function getDrilldown(so: SpaceObject) {
    return QueryService.getAsyncInstance().then((qs) => qs.getDrilldown(so));
  }

  let tags = ("tags" in so && so.tags) || [];
</script>

<h1>{so.title}</h1>
<!-- <dl>
  <dt>Category</dt>
  <dl>{so.category}</dl>
</dl> -->
<section class="tags">
  {#each tags as tag}
    <div class="tag {tag}" />
  {/each}
</section>

<section class="links">
  {#if "wiki" in so}
    <a href={so.wiki}><div class="link wiki" /></a>
  {/if}
  {#if "github" in so}
    <a href={so.github}><div class="link git" /></a>
  {/if}
</section>

<section class="md">
  {#if "drilldown" in so}
    {#await getDrilldown(so)}
      <Loader />
    {:then drilldown}
      {@html drilldown.parsed_markdown}
    {/await}
  {/if}
</section>
<slot />

<footer class="edit-this">
  <div class="quiet-text">
    Edit this by a <a
      target="_blank"
      href="https://github.com/asafamr/spacify/tree/staging/space-data/content/{so.category}/{so.uid}.json"
      >manual pull request</a
    >
  </div>
  <div class="quiet-text">
    Edit this by a <a
      target="_blank"
      href="/admin/#/collections/{so.type}/entries/{so.category}/{so.uid}"
      >Netlify CMS pull request</a
    >
  </div>
</footer>

<style>
  .edit-this {
    margin-top: auto;
  }
  .edit-this div {
    padding: 0.2rem;
  }
  h1 {
    width: 100%;
    color: var(--header, rgb(17, 17, 17));
  }
</style>
