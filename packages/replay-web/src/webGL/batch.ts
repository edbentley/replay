import {
  ImageTexture,
  LineTexture,
  RectangleTexture,
  Texture,
} from "@replay/core/dist/t";
import { m2d, Matrix2D } from "./matrix";

// The types should match Texture.type
export type MutBatcher =
  | { type: "none"; elements: [] }
  | ImageBatcher
  | { type: "spriteSheet"; elements: [] }
  | LineBatcher
  | ShapeBatcher
  | RectBatcher
  | {
      type: "circle";
      elements: [];
    }
  | {
      type: "text";
      elements: [];
    };

type ImageBatcher = {
  type: "image";
  fileName: string; // batch by file name
  elements: ImageBatchElement[];
};
type RectBatcher = {
  type: "rectangle";
  elements: RectBatchElement[];
};
type LineBatcher = {
  type: "line";
  elements: LineBatchElement[];
  pathLength: number; // can only batch same path length
};
type ShapeBatcher = {
  type: "shape";
  elements: ShapeBatchElement[];
  pathLength: number; // can only batch same path length
};

export type ImageBatchElement = {
  matrix: Matrix2D;
  opacity: number;
};

export type RectBatchElement = {
  matrix: Matrix2D;
  opacity: number;
  colour: string;
};

export type LineBatchElement = {
  matrix: Matrix2D;
  opacity: number;
  colour: string;
  thickness: number;
  roundCap: boolean;
  path: [number, number][];
};

export type ShapeBatchElement = {
  matrix: Matrix2D;
  opacity: number;
  colour: string;
  path: [number, number][];
};

export function handleTexture(
  batcher: MutBatcher,
  texture: Texture,
  matrix: Matrix2D,
  opacity: number,
  draw: (batcher: MutBatcher) => void
): MutBatcher {
  if (texture.type === "line") {
    // Line is a special case since it has stroke so uses 2 different batchers

    if (texture.props.fillColor) {
      handleIndividualTexture(
        batcher,
        { ...texture, props: { ...texture.props, color: undefined } },
        matrix,
        opacity,
        draw
      );
    }
    if (texture.props.color) {
      handleIndividualTexture(
        batcher,
        { ...texture, props: { ...texture.props, fillColor: undefined } },
        matrix,
        opacity,
        draw
      );
    }

    return batcher;
  }

  return handleIndividualTexture(batcher, texture, matrix, opacity, draw);
}

function handleIndividualTexture(
  batcher: MutBatcher,
  texture: Texture,
  matrix: Matrix2D,
  opacity: number,
  draw: (batcher: MutBatcher) => void
) {
  const didAdd = addToBatcher(batcher, texture, matrix, opacity);

  if (!didAdd) {
    draw(batcher);
    return newBatcher(batcher, texture, matrix, opacity);
  }

  return batcher;
}

function newBatcher(
  batcher: MutBatcher,
  texture: Texture,
  matrix: Matrix2D,
  opacity: number
): MutBatcher {
  batcher.elements.length = 0;

  switch (texture.type) {
    case "image": {
      const newBatcher = batcher as ImageBatcher;
      newBatcher.type = "image";
      newBatcher.fileName = texture.props.fileName;
      newBatcher.elements.push(newImage(texture, matrix, opacity));
      return newBatcher;
    }

    case "rectangle": {
      const newBatcher = batcher as RectBatcher;
      newBatcher.type = "rectangle";
      newBatcher.elements.push(newRect(texture, matrix, opacity));
      return newBatcher;
    }

    case "line": {
      if (texture.props.fillColor) {
        const newBatcher = batcher as ShapeBatcher;
        newBatcher.type = "shape";
        newBatcher.elements.push(
          newShape(texture, matrix, opacity, texture.props.fillColor)
        );
        return newBatcher;
      }
      if (texture.props.color) {
        const newBatcher = batcher as LineBatcher;
        newBatcher.type = "line";
        newBatcher.elements.push(
          newLine(texture, matrix, opacity, texture.props.color)
        );
        return newBatcher;
      }
      // No colours set
      batcher.type = "none";
      return batcher;
    }

    default: {
      batcher.type = "none";
      return batcher;
    }
  }
}

/**
 * Returns if was able to add or not and mutates batcher
 */
function addToBatcher(
  batcher: MutBatcher,
  texture: Texture,
  matrix: Matrix2D,
  opacity: number
): boolean {
  if (batcher.type === "none") return false;

  if (
    batcher.type === "image" &&
    texture.type === "image" &&
    batcher.fileName === texture.props.fileName
  ) {
    batcher.elements.push(newImage(texture, matrix, opacity));
    return true;
  }

  if (batcher.type === "rectangle" && texture.type === "rectangle") {
    batcher.elements.push(newRect(texture, matrix, opacity));
    return true;
  }

  if (texture.type === "line") {
    if (
      batcher.type === "line" &&
      texture.props.color &&
      batcher.pathLength === texture.props.path.length
    ) {
      batcher.elements.push(
        newLine(texture, matrix, opacity, texture.props.color)
      );
      return true;
    }

    if (
      batcher.type === "shape" &&
      texture.props.fillColor &&
      batcher.pathLength === texture.props.path.length
    ) {
      batcher.elements.push(
        newShape(texture, matrix, opacity, texture.props.fillColor)
      );
      return true;
    }
  }

  return false;
}

function newImage(
  texture: ImageTexture,
  matrix: Matrix2D,
  opacity: number
): ImageBatchElement {
  return {
    matrix: m2d.multiply(
      matrix,
      // scale converts vertices in shader (which is -0.5 / 0.5 points) to the
      // size of the image
      m2d.getScaleMatrix(texture.props.width, texture.props.height)
    ),
    opacity: texture.props.opacity * opacity,
  };
}

function newRect(
  texture: RectangleTexture,
  matrix: Matrix2D,
  opacity: number
): RectBatchElement {
  return {
    matrix: m2d.multiply(
      matrix,
      // scale converts vertices in shader (which is -0.5 / 0.5 points) to the
      // size of the rect
      m2d.getScaleMatrix(texture.props.width, texture.props.height)
    ),
    opacity: texture.props.opacity * opacity,
    colour: texture.props.color,
  };
}

function newLine(
  texture: LineTexture,
  matrix: Matrix2D,
  opacity: number,
  colour: string
): LineBatchElement {
  return {
    matrix,
    opacity: texture.props.opacity * opacity,
    colour,
    thickness: texture.props.thickness,
    roundCap: texture.props.lineCap === "round",
    path: texture.props.path,
  };
}

function newShape(
  texture: LineTexture,
  matrix: Matrix2D,
  opacity: number,
  colour: string
): ShapeBatchElement {
  return {
    matrix,
    opacity: texture.props.opacity * opacity,
    colour,
    path: texture.props.path,
  };
}
