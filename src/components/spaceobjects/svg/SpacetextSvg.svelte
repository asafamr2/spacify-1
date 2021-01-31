<script lang="ts">

  import type { SceneText } from "../../../../space-data/schema/schema";
  import { strHash, clamp, bandpass } from "../../../helpers/maff";
  import { PointOp } from "../../../helpers/Point";
  import type { View } from "../../../helpers/View";

  export let so: SceneText;
  export let view: View;

  // const dispatch = createEventDispatcher();

  let svgPath: string;
  let pathIdent: string;
  let saneFontSize: number;
  $: opacity = bandpass([0.01, 0.05, 0.5, 0.6], so.size / view.width);
  {
    const rotateOp = PointOp.chain((op) =>
      op.rotate(-so.rotation).add(so.position)
      ); // y axis inverted - invert rotation
    const startPoint = rotateOp({ x: -so.size / 2, y: 0 });
    const endPoint = rotateOp({ x: +so.size / 2, y: 0 });
    const curvature = clamp(so.arc, 0.001, 0.999999);
    const radius = so.size / 2 + 1 / curvature - 1;
    svgPath = `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 0 1 ${endPoint.x} ${endPoint.y}`;
    const arcLength = 2 * radius * Math.asin(so.size / (2 * radius));
    saneFontSize = (2 * arcLength) / (so.title.length + 2);
    pathIdent = "p" + strHash(svgPath);
  }
</script>

<path id={pathIdent} d={svgPath} style="fill:none" />
<text
  font-size={saneFontSize}
  class="space-text"
  text-anchor="middle"
  opacity={opacity}
  style="user-select: none;">
  <textPath xlink:href={"#" + pathIdent} startOffset="50%">
    {so.title}
  </textPath>
</text>
