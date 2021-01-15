<script lang="ts">
	import { Planet, SpaceObject, SpaceText } from "./SpaceObjects";
	import { onMount, space, text } from "svelte/internal";
	import { Point } from "./helpers/Point";
	import { bandpass, strHash } from "./helpers/maff";
	import StarsBg from "./components/webgl/StarsBG.svelte";
	import { viewportable } from "./actions/viewportable";
	import type { View } from "./helpers/View";
	import Infotab from "./components/Infotab.svelte";
	let spaceObjects: SpaceObject[] = [
		new Planet({ min: new Point(10, 10), max: new Point(90, 90) }, "p1"),
		new Planet({ min: new Point(11, 11), max: new Point(12, 12) }, "p1"),
		new SpaceText(
			"Hola!",
			new Point(11.5, 11.5),
			/*size*/ 20,
			/*rotation*/ -30,
			/*curve*/ 0.3,
			"ttt"
		),
	];

	let currentView: View = null;
	let selectedObject: SpaceObject = null;

	function getObjectsInView(spaceObjs: SpaceObject[], view: View) {
		let ret = [];
		for (let so of spaceObjs) {
			if (so instanceof Planet) {
				const x = 0.5 * (so.rect.min.x + so.rect.max.x);
				const rad = 0.5 * (so.rect.max.x - so.rect.min.x);
				const y = 0.5 * (so.rect.min.y + so.rect.max.y);
				ret.push({
					props: {
						cx: x,
						cy: y,
						r: rad,
						class: "planet",
						opacity: bandpass(
							[0, 0.001, 0.2, 0.6],
							rad / view.width
						),
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

	onMount(() => {});
</script>

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

<svelte:window
	on:contextmenu|capture|stopPropagation|preventDefault={() => false} />

<main use:viewportable on:viewchange={viewchange}>
	{#if currentView}
		
		<StarsBg view={currentView} />
		<svg class="svgboard" viewBox={currentView.toSvgString()} on:click|self={() => (selectedObject = null)}>
			{#each getObjectsInView(spaceObjects, currentView) as so}
				{#if so?.props?.class === 'planet'}
					<circle
						{...so.props}
						on:click={() => (selectedObject = so)} />
				{:else if so?.props?.class === 'space-text'}
					<path id={so.pathIdent} d={so.path} style="fill:none" />
					<!-- svelte-ignore component-name-lowercase -->
					<text
						{...so.props}
						on:click={() => (selectedObject = so)}
						text-anchor="middle"
						style="user-select: none;">
						<textPath
							xlink:href={'#' + so.pathIdent}
							startOffset="50%">
							{so.text}
						</textPath>
					</text>
				{/if}
			{/each}
		</svg>
		<Infotab selected={selectedObject} />
	{/if}
</main>
