<script lang="ts">
  import type { SpaceObject } from "../../../../space-data/schema/schema";
  export let so: SpaceObject;

  let tags = ("tags" in so && so.tags) || [];
</script>

<div>
  <h1>{so.title}</h1>
  <dl>
    <dt>Category</dt>
    <dl>{so.category}</dl>
  </dl>
  <section class="tags">
    {#each tags as tag}
      <div class="tag {tag}" />
    {/each}
  </section>

  <section class="links">
    {#if so.wiki}
      <a href="{so.wiki}"><div class="link wiki" /></a>
    {/if}
    {#if 'github' in so}
      <a href="{so.wiki}"><div class="link wiki" /></a>
    {/if}
  </section>

  <section class="md">
    {#if so.markdown}
      {@html so.markdown}
    {/if}
  </section>

  <footer class="edit-this">
    <div>Edit this by a <a href="https://github.com/asafamr/spacify/tree/staging/space-data/objects/{so.uid}.json">manual pull request</a></div>
    <div>Edit this by a <a href="/admin/#/collections">Netlify CMS pull request</a></div>
  </footer>
</div>

<style>
  h1 {
    width: 100%;
    color: var(--header, black);
  }
</style>
