<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { throttle } from "../../helpers/functional";
  import type { View } from "../../helpers/View";
  import { fs, vs } from "./glslimport";

  export let view: View;

  let renderCallback: () => void;
  let updateResolution: () => void;
  $: {
    if (view && renderCallback) renderCallback();
    //renderCallback();
  }

  let container: Element;

  function init() {
    let renderer: THREE.WebGLRenderer;

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      viewvec: { type: "v4", value: new THREE.Vector4() },
    };

    const startTime = Date.now();
    const ratio = 0.5;

    updateResolution = () => {
      if(!container)return;
      uniforms.resolution.value.set(
        container.clientWidth * ratio,
        container.clientHeight * ratio
      );
      renderer.setSize(container.clientWidth, container.clientHeight);
      if (renderCallback) renderCallback();
    };

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vs,
      fragmentShader: fs,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();

    // renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    renderer.setPixelRatio(ratio);
    container.appendChild(renderer.domElement);
    renderCallback = () => {
      let elapsedMilliseconds = Date.now() - startTime;
      if (renderer) {
        uniforms.time.value = (10000 * elapsedMilliseconds) / 1000;
        uniforms.viewvec.value.set(
          view.x,
          -view.y - view.height,
          view.width,
          view.height
        );
        renderer.render(scene, camera);
      }
    };
    renderCallback = throttle(renderCallback, 5);
    setTimeout(() => {
      updateResolution();
      renderCallback();
    });
  }

  onMount(() => {
    init();
    view = view;

    return () => {};
  });
</script>

<style>
  #container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(112, 92, 101);
  }
</style>

<svelte:window
  on:resize={() => {
    if (updateResolution ) updateResolution();
  }} />

<div id="container" bind:this={container} />
