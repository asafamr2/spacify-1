<script lang="ts">
  import { Planet, SpaceObject, SpaceText } from "./SpaceObjects";
  import { bandpass, strHash } from "./helpers/maff";
  import StarsBg from "./components/webgl/StarsBG.svelte";
  import { viewportable } from "./actions/viewportable";
  import type { View } from "./helpers/View";
  import Infotab from "./components/Infotab.svelte";
  import { onMount } from "svelte/internal";

  let spaceObjects: SpaceObject[] = [
    new Planet({ x: 10, y: 10 }, 2, "asd"),
    // new Planet({ min: new Point(11, 11), max: new Point(12, 12) }, "p2"),
    new SpaceText(
      "Hola!",
      { x: 11, y: 11 },
      /*size*/ 20,
      /*rotation*/ -30,
      /*curve*/ 0.3,
      "ttt"
    ),
  ];

  let currentView: View | null = null;
  let selectedObject: SpaceObject | null = null;

  fetch(`test.json`)
    .then((r) => r.json())
    .then((js) => console.log(js));

  function getObjectsInView(spaceObjs: SpaceObject[], view: View) {
    let ret = [];
    for (let so of spaceObjs) {
      if (so instanceof Planet) {
        ret.push({
          props: {
            cx: so.center.x,
            cy: so.center.y,
            r: so.radius,
            class: "planet",
            opacity: bandpass([0, 0.001, 0.2, 0.6], so.radius / view.width),
          },
        });
      } else if (so instanceof SpaceText) {
        ret.push({
          props: {
            class: "space-text",
            "font-size": so.saneFontSize,
            opacity: bandpass(
              [0, 0.01, 0.2, 0.5],
              so.saneFontSize / view.width
            ),
          },
          path: so.path,
          text: so.text,
          pathIdent: "p" + strHash(so.path),
        });
      }
    }
    return ret;
  }

  function viewchange(viewChange: CustomEvent<View>) {
    currentView = viewChange.detail;
  }
  function setSelected(sel: any) {
    selectedObject = sel;
  }

  onMount(() => {});
</script>

<svelte:window
  on:contextmenu|capture|stopPropagation|preventDefault={() => false}
/>
<main use:viewportable on:viewchange={viewchange}>
  {#if currentView}
    <StarsBg view={currentView} />
    <svg
      class="svgboard"
      viewBox={currentView.toSvgString()}
      on:click|self={() => (selectedObject = null)}>
      {#each getObjectsInView(spaceObjects, currentView) as so}
        {#if so?.props?.class === "planet"}
          <circle {...so.props} on:click={() => setSelected(so)} />
        {:else if so?.props?.class === "space-text"}
          <path id={so.pathIdent} d={so.path} style="fill:none" />
          <!-- svelte-ignore component-name-lowercase -->
          <text
            {...so.props}
            on:click={() => setSelected(so)}
            text-anchor="middle"
            style="user-select: none;">
            <textPath xlink:href={"#" + so.pathIdent} startOffset="50%">
              {so.text}
            </textPath>
          </text>
        {/if}
      {/each}
    </svg>
    <Infotab selected={selectedObject} />
  {/if}
</main>

<style>
  main {
    margin: 0 auto;
    width: 100%;
    height: 100%;
    display: block;
  }
  /* svg {
		/* background-color: #402641; 
	} */
  .planet {
    fill: #d6a265;
    cursor: pointer;
  }
  .svgboard {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
