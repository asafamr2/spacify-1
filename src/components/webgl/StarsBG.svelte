<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { throttle } from "../../helpers/functional";
  import type { View } from "../../helpers/View";
  import { ViewportService } from "../../services/ViewportService";
  import { fs, vs } from "./glslimport";
  let view: View;

  let renderCallback: () => void;
  let updateResolution: () => void;

  ViewportService.getAsyncInstance().then((vs) =>
    vs.getViewportStore().subscribe((v) => {
      view = v;
      if (renderCallback) renderCallback();
    })
  );

  let container: Element;

  function init() {
    let renderer: THREE.WebGLRenderer;

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      viewvec: { type: "v4", value: new THREE.Vector4() },

      //   background-color: #000000;
      // background-color: #221036;
      // background-color: #56548a;
      // background-color: #a8b5ce;
      colorsgrad: {
        type: "v3[4]",
        value: [
          new THREE.Color(0x2b2b2b),
          new THREE.Color(0x2b2b2b),
          new THREE.Color(0x737373),
          new THREE.Color(0x737373),
        ],
      },
      colorsgradt: { type: "f[2]", value: [0.14, 0.9] },
    };

    const startTime = Date.now();
    const ratio = window.screen.width > 1080 ? 0.5 : 1;

    updateResolution = () => {
      if (!container) return;
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

    const mul = 500;
    const add = [0, 500];

    // renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    renderer.setPixelRatio(ratio);
    container.appendChild(renderer.domElement);
    renderCallback = () => {
      let elapsedMilliseconds = Date.now() - startTime;
      if (renderer) {
        uniforms.time.value = (10000 * elapsedMilliseconds) / 1000;
        uniforms.viewvec.value.set(
          (view.x + add[0] - view.width / 2) * mul,
          -(view.y + add[1] + view.height / 2) * mul,
          view.width * mul,
          view.height * mul
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

<svelte:window
  on:resize={() => {
    if (updateResolution) updateResolution();
  }}
/>

<div id="container" bind:this={container} />

<style>
  #container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* background-color: #000000;
    background-color: #221036;
    background-color: #56548a;
    background-color: #a8b5ce; */
    background-color: hsl(242, 39%, 14%);
  }
</style>
