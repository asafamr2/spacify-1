<script lang="ts">
import type { SpaceObject } from "../../space-data/schema/schema";

  export let selected: SpaceObject | null;

</script>

<div
  class="info-menu"
  class:selected={!!selected}
  
>
  <div class="content">
    {#if !!selected}this is the content{selected.uid}{/if}
  </div>
  <div class="opener">
    <div class="spacer" />
    <svg width="3rem" height="4rem" viewBox="0 0 3 4">
      <path
        d="M0 0 
                a 0.5 0.5 90 0 0 0.5 0.5 
                l 2 0 
                a 0.5 0.5 90 0 1 0.5 0.5 
                l 0 2 
                a 0.5 0.5 90 0 1 -0.5 0.5
                l -2 0
                a 0.5 0.5 90 0 0 -0.5 0.5
                Z"
      />
    </svg>
    <!-- <button>{JSON.stringify(mainDivHeight)}</button> -->
  </div>
</div>

<style>
  .info-menu {
    position: absolute;
    left: 0;
    display: flex;
    --menu-bg: rgba(255, 255, 255, 0.637);
  }
  .opener {
    display: flex;
    width: 4rem;
    height: 100vh;
  }
  .spacer {
    width: 0.5rem;
    background-color: var(--menu-bg);
  }
  .opener svg {
    margin-top: 2rem;
    fill: var(--menu-bg);
  }
  .content {
    margin-left: -10rem;
    width: 10rem;
    transition: margin 0.3s;
    background-color: var(--menu-bg);
  }
  .selected .content {
    /* width: calc(100% - 2rem); */
    margin-left: 0rem;
  }
</style>
