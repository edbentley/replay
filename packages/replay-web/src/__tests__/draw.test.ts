import { drawCanvas } from "../draw";
import { canvasToImage } from "./utils";
import { t, DeviceSize, mask } from "@replay/core";
import { SpriteTextures } from "@replay/core/dist/sprite";
import { getDefaultProps } from "@replay/core/dist/props";

const deviceSize: DeviceSize = {
  width: 300,
  height: 200,
  widthMargin: 0,
  heightMargin: 0,
  deviceWidth: 500,
  deviceHeight: 500,
};

let canvas: HTMLCanvasElement;
let render: (textures: SpriteTextures["textures"]) => void;

beforeAll(() => {
  render = (textures) => {
    canvas = document.body.appendChild(document.createElement("canvas"));
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    drawCanvas(ctx, deviceSize, {}, { name: "Courier", size: 12 }).render({
      id: "test",
      baseProps: getDefaultProps({}),
      textures,
    });
  };
});

test("Can draw text", () => {
  render([
    t.text({
      x: -100,
      y: 100,
      rotation: 45,
      font: { name: "Arial", size: 10 },
      color: "blue",
      text: "Hello Test",
    }),
    t.text({
      x: -100,
      y: 0,
      rotation: 0,
      opacity: 0.5,
      font: { name: "Arial", size: 40 },
      color: "red",
      text: "Hello Test",
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw circles", () => {
  render([
    t.circle({
      x: 0,
      y: 50,
      rotation: 45,
      radius: 25,
      color: "blue",
    }),
    t.circle({
      x: 0,
      y: -50,
      rotation: 0,
      opacity: 0.5,
      radius: 50,
      color: "red",
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
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 0,
      width: 100,
      height: 10,
      color: "green",
    }),
  ]);

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can draw lines", () => {
  render([
    t.line({
      x: 0,
      y: 50,
      thickness: 1,
      color: "blue",
      opacity: 0.5,
      path: [
        [0, 0],
        [30, 30],
        [60, 30],
      ],
    }),
    t.line({
      x: 0,
      y: -50,
      rotation: 90,
      thickness: 5,
      color: "red",
      path: [
        [10, -10],
        [100, -100],
      ],
    }),
    t.line({
      x: 0,
      y: 0,
      thickness: 5,
      color: "red",
      path: [], // nothing drawn
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
      align: "left",
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
      align: "right",
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
      font: { name: "Calibri", size: 12 },
      color: "red",
      x: 0,
      y: 100,
      anchorY: 6,
    }),
    t.text({
      text: "Hello",
      font: { name: "Calibri", size: 12 },
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

test("Can mask with circle, rectangle and line", () => {
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

// images should be tested in replay-web.test.ts as it involves asset loading
// logic
