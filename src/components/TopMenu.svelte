<svelte:options immutable={true} />

<script lang="ts">
  import { UrlManager } from "../services/UrlManager";

  const urlManager = UrlManager.getInstance();

  let hasBack = false;

  urlManager
    .getAllChangesStore()
    .subscribe(() => (hasBack = urlManager.hasBack()));
  function help() {}
  function back() {
    if (hasBack) history.back();
  }
  function share() {}
  // function search() {}
</script>

<header>
  <button class="menu-item" on:click={help}>
    <!--question mark-->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </button>
  <button class="menu-item" class:disabled={!hasBack} on:click={back}>
    <!--left arrow-->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
      />
    </svg>
  </button>
  <button class="menu-item" on:click={share}>
    <!--share-->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  </button>
  <!-- <button class="menu-item" onclick={search}>
    <! --search circle- ->
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button> -->
</header>

<style>
  header {
    position: absolute;
    z-index: 25;
    background-color: transparent;
  }
  button.menu-item {
    width: 5rem;
    background-color: transparent;
    border: none;
    margin: -1px -0.5rem;
  }
  button.menu-item:hover {
    color: yellow;
  }
  button.menu-item.disabled {
    color: rgb(97, 97, 97);
  }
  button.menu-item.disabled:hover {
    color: rgb(97, 97, 97);
  }
</style>
