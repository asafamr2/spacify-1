<script lang="ts">
  import type { SpaceObject } from "../../../../space-data/schema/schema";
  export let so: SpaceObject;

  let tags = ("tags" in so && so.tags) || [];
</script>

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
    {#if 'wiki' in so}
      <a href="{so.wiki}"><div class="link wiki" /></a>
    {/if}
    {#if 'github' in so}
      <a href="{so.github}"><div class="link git" /></a>
    {/if}
  </section>

  <section class="md">
    {#if 'markdown' in so}
      {@html so.markdown}
    {/if}
  </section>
  <slot></slot>

  <footer class="edit-this">
    <div  class="quiet-text">Edit this by a <a target="_blank" href="https://github.com/asafamr/spacify/tree/staging/space-data/content/{so.category}/{so.uid}.json">manual pull request</a></div>
    <div class="quiet-text">Edit this by a <a target="_blank" href="/admin/#/collections/{so.type}/entries/{so.category}/{so.uid}">Netlify CMS pull request</a></div>
  </footer>

<style>
  .edit-this{
    margin-top: auto;
  }
  .edit-this div{
    padding: 0.2rem;
  }
  h1 {
    width: 100%;
    color: var(--header, rgb(17, 17, 17));
  }
</style>
