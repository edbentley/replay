import { draw } from "../webGL/drawGL";
import { canvasToImage } from "./utils";
import { t, DeviceSize, mask, Texture, t2 } from "@replay/core";
import { m2d } from "@replay/core/src/matrix";
import { MutableTexture, newArrayProps } from "@replay/core/dist/t2";

const deviceSize: DeviceSize = {
  width: 300,
  height: 300,
  widthMargin: 0,
  heightMargin: 0,
  fullWidth: 300,
  fullHeight: 300,
  deviceWidth: 500,
  deviceHeight: 500,
};

let canvas: HTMLCanvasElement;
let offscreenCanvas: HTMLCanvasElement;
let render: (textures: (Texture | MutableTexture)[]) => void;

beforeAll(() => {
  render = (textures) => {
    canvas = document.body.appendChild(document.createElement("canvas"));
    offscreenCanvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { stencil: true })!;
    gl.canvas.width = deviceSize.deviceWidth;
    gl.canvas.height = deviceSize.deviceHeight;

    const glInstArrays = gl.getExtension("ANGLE_instanced_arrays")!;
    const glVao = gl.getExtension("OES_vertex_array_object")!;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const { renderTexture, getInitTextureState, getInitMaskState } = draw(
      gl,
      glInstArrays,
      glVao,
      offscreenCanvas,
      deviceSize.width,
      deviceSize.height,
      {},
      { family: "Courier", size: 12 },
      "white",
      1
    );

    textures.forEach((texture) => {
      if ("isMut" in texture && "newProps" in texture) {
        const array = texture.array();
        texture.props = Array.from({ length: array.length }).map((_, index) => {
          const props = newArrayProps(
            texture,
            texture.newProps(array[index], index)
          );
          texture.update?.(props as any, array[index], index);
          return props;
        }) as any;
      }

      renderTexture(
        {
          opacity: 1,
          transformation: m2d.getScaleMatrix(
            2 / deviceSize.fullWidth,
            2 / deviceSize.fullHeight
          ),
          transformationGameCoords: m2d.identityMatrix,
          hasMask: false,
        },
        texture,
        getInitTextureState(texture),
        getInitMaskState(null)
      );
    });
  };
});

// Text doesn't show: https://github.com/stackgl/headless-gl/issues/149
test.skip("Can draw text", () => {
  const array = [10, 5];

  render([
    t.text({
      x: -100,
      y: 100,
      rotation: 45,
      font: { family: "Arial", size: 10 },
      color: "blue",
      text: "Hello Test",
    }),
    t.text({
      x: -100,
      y: 0,
      rotation: 0,
      opacity: 0.5,
      font: { family: "Arial", size: 40 },
      color: "red",
      text: "Hello Test",
    }),

    t2.textArray({
      props: (numb, index) => ({
        color: "blue",
        text: `${numb}`,
        x: 50,
        y: 50 - 100 * index,
      }),
      array: () => array,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw circles", () => {
  const array = [10, 5];

  render([
    t.circle({
      x: -50,
      y: 50,
      rotation: 45,
      radius: 25,
      color: "blue",
    }),
    t.circle({
      x: -50,
      y: -50,
      rotation: 0,
      opacity: 0.5,
      radius: 50,
      color: "red",
    }),
    t2.circleArray({
      props: (radius, index) => ({
        color: "blue",
        radius,
        x: 50,
        y: 50 - 100 * index,
      }),
      array: () => array,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw rectangles", () => {
  render([
    t.rectangle({
      x: 0,
      y: 50,
      rotation: 45,
      opacity: 0.5,
      width: 50,
      height: 50,
      color: "blue",
    }),
    t.rectangle({
      x: 0,
      y: -50,
      rotation: 0,
      opacity: 1,
      width: 100,
      height: 10,
      color: "red",
    }),
    t.rectangle({
      width: 20,
      height: 20,
      color: "green",
    }),
    // Not premultiplying alpha in shader can make this show up
    t.rectangle({
      opacity: 0,
      width: 10,
      height: 10,
      color: "red",
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can batch draw rectangles", () => {
  const array = [10, 5];

  render([
    t.rectangleArray({
      props: [
        {
          x: -50,
          y: 50,
          rotation: 45,
          opacity: 0.5,
          width: 50,
          height: 50,
          color: "blue",
        },
        {
          x: -50,
          y: -50,
          rotation: 0,
          opacity: 1,
          width: 100,
          height: 10,
          color: "red",
        },
        {
          x: -50,
          width: 20,
          height: 20,
          color: "green",
        },
      ],
    }),

    t2.rectangleArray({
      props: (width, index) => ({
        color: "blue",
        width,
        height: 20,
        x: 50,
        y: 50 - 100 * index,
      }),
      array: () => array,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw lines", () => {
  const array = [10, 5];

  render([
    t.line({
      x: -50,
      y: 50,
      color: "blue",
      opacity: 0.5,
      path: [
        [0, 0],
        [30, 30],
        [60, 30],
      ],
    }),
    t.line({
      x: -50,
      y: -50,
      rotation: 90,
      thickness: 5,
      color: "red",
      path: [
        [10, -10],
        [100, -100],
      ],
      lineCap: "round",
    }),
    t.line({
      x: -50,
      y: 0,
      thickness: 5,
      color: "red",
      path: [], // nothing drawn
    }),

    t2.lineArray({
      props: (width, index) => ({
        color: "blue",
        path: [
          [0, 0],
          [width, width],
          [width, -width],
        ],
        x: 50,
        y: 50 - 100 * index,
      }),
      array: () => array,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw shapes", () => {
  const array = [10, 5];

  render([
    t.line({
      x: -50,
      y: 50,
      fillColor: "blue",
      path: [
        [0, 0],
        [30, 30],
        [60, 30],
      ],
    }),
    t.line({
      x: -50,
      fillColor: "red",
      path: [
        [0, 0],
        [-50, -50],
        [-40, -100],
        [40, -100],
        [50, -50],
        [0, 0],
      ],
    }),

    t2.lineArray({
      props: (width, index) => ({
        fillColor: "blue",
        path: [
          [0, 0],
          [width, width],
          [width, -width],
        ],
        x: 50,
        y: 50 - 100 * index,
      }),
      array: () => array,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can scale X and Y", () => {
  render([
    // square rectangle first scaled tall
    // then rotated to be wide
    t.rectangle({
      x: 0,
      y: 0,
      rotation: 90,
      scaleY: 2,
      width: 50,
      height: 50,
      color: "blue",
    }),
    // blue circle should be half the size of red
    t.circle({
      x: 0,
      y: -50,
      radius: 5,
      color: "red",
    }),
    t.circle({
      x: 50,
      y: -50,
      scaleX: 0.5,
      scaleY: 0.5,
      radius: 5,
      color: "blue",
    }),
    // very thick line
    t.line({
      x: 0,
      y: 50,
      thickness: 5,
      color: "red",
      scaleX: 20,
      path: [
        [0, 0],
        [0, 20],
      ],
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can change anchor X and Y", () => {
  render([
    // center point
    t.circle({
      radius: 5,
      color: "black",
    }),
    // bottom-left
    t.rectangle({
      width: 50,
      height: 50,
      color: "blue",
      opacity: 0.2,
      anchorX: 25,
      anchorY: 25,
      rotation: 10,
    }),
    // top-left
    t.rectangle({
      width: 50,
      height: 50,
      color: "red",
      opacity: 0.2,
      anchorX: 25,
      anchorY: -25,
      rotation: 10,
    }),
    // bottom-right
    t.rectangle({
      width: 50,
      height: 50,
      color: "green",
      opacity: 0.2,
      anchorX: -25,
      anchorY: 25,
      rotation: 10,
    }),
    // top-right
    t.rectangle({
      width: 50,
      height: 50,
      color: "yellow",
      opacity: 0.2,
      anchorX: -25,
      anchorY: -25,
      rotation: 10,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  // Health bar
  render([
    t.rectangle({
      width: 100,
      height: 10,
      color: "red",
      anchorX: -50,
      scaleX: 1,
      x: 0,
      y: 50,
    }),
    t.rectangle({
      width: 100,
      height: 10,
      color: "red",
      anchorX: -50,
      scaleX: 0.5,
      x: 0,
      y: 0,
    }),
    t.rectangle({
      width: 100,
      height: 10,
      color: "red",
      anchorX: -50,
      scaleX: 0.1,
      x: 0,
      y: -50,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  // Text align
  render([
    t.text({
      text: "Hello",
      font: {
        align: "left",
      },
      color: "red",
      x: 0,
      y: 50,
      rotation: 10,
    }),
    t.line({
      color: "black",
      path: [
        [-100, 0],
        [100, 0],
      ],
      thickness: 1,
      x: 0,
      y: 50,
    }),

    t.text({
      text: "Hello",
      color: "red",
      x: 0,
      y: 0,
      rotation: 10,
    }),
    t.line({
      color: "black",
      path: [
        [-100, 0],
        [100, 0],
      ],
      thickness: 1,
      x: 0,
      y: 0,
    }),

    t.text({
      text: "Hello",
      font: {
        align: "right",
      },
      color: "red",
      x: 0,
      y: -50,
      rotation: 10,
    }),
    t.line({
      color: "black",
      path: [
        [-100, 0],
        [100, 0],
      ],
      thickness: 1,
      x: 0,
      y: -50,
    }),

    t.text({
      text: "Hello",
      font: { family: "Calibri", size: 12 },
      color: "red",
      x: 0,
      y: 100,
      anchorY: 6,
    }),
    t.text({
      text: "Hello",
      font: { family: "Calibri", size: 12 },
      color: "blue",
      x: 0,
      y: 100,
      anchorY: -6,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  // Line
  render([
    // bottom-left
    t.line({
      color: "red",
      thickness: 1,
      path: [
        [-50, -50],
        [50, 50],
      ],
      anchorX: 50,
      anchorY: 50,
    }),
    // top-right
    t.line({
      color: "blue",
      thickness: 1,
      path: [
        [-50, -50],
        [50, 50],
      ],
      anchorX: -50,
      anchorY: -50,
    }),
    t.line({
      color: "black",
      thickness: 1,
      path: [
        [-50, -50],
        [50, 50],
      ],
      opacity: 0.5,
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

// Masks not working in test renderer
test.skip("Can mask with circle, rectangle and line", () => {
  render([
    t.rectangle({
      x: -60,
      width: 20,
      height: 20,
      color: "black",
      mask: null,
    }),
    t.rectangle({
      x: -20,
      width: 20,
      height: 20,
      color: "black",
      mask: mask.circle({
        radius: 5,
        x: 10,
      }),
    }),
    t.rectangle({
      x: 20,
      width: 20,
      height: 20,
      color: "black",
      mask: mask.rectangle({
        width: 5,
        height: 5,
        y: 10,
      }),
    }),
    t.rectangle({
      x: 60,
      width: 20,
      height: 20,
      color: "black",
      mask: mask.line({
        path: [
          [0, 0],
          [10, 0],
          [10, 10],
        ],
      }),
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw gradients", () => {
  render([
    // Skip text
    // t.text({
    //   x: -70,
    //   font: { family: "Arial", size: 10 },
    //   color: "blue",
    //   gradient: {
    //     type: "linearVert",
    //     colors: ["red", "#FFFFFF"],
    //     opacities: [1, 0],
    //     height: 20,
    //   },
    //   text: "Hello",
    // }),
    t.rectangle({
      x: -20,
      y: 0,
      width: 20,
      height: 20,
      color: "red",
      gradient: {
        type: "linearHoriz",
        colors: ["purple", "#ff0000"],
        opacities: [1, 0],
        width: 60,
      },
    }),
    t.rectangle({
      x: 20,
      y: 0,
      width: 10,
      height: 10,
      color: "red",
      gradient: {
        type: "linearHoriz",
        colors: ["black", "white", "black"],
        width: 10,
      },
    }),
    t.line({
      x: 70,
      path: [
        [-10, -10],
        [10, -10],
        [0, 10],
      ],
      fillGradient: {
        type: "linearVert",
        colors: ["purple", "#FFA500"],
        height: 20,
      },
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

// images should be tested in replay-web.test.ts as it involves asset loading
// logic
