import { getLocalCoordsForSprite } from "@replay/core/dist/core";
import { getParentCoordsForSprite } from "../coords";
import { SpriteBaseProps } from "@replay/core/dist/props";

test("Can get inner coordinate outside of Sprite", () => {
  for (let scaleX = -2; (scaleX += 0.5); scaleX <= 2) {
    for (let scaleY = -2; (scaleY += 0.5); scaleY <= 2) {
      for (let anchorX = -10; (anchorX += 5); anchorX <= 10) {
        for (let anchorY = -10; (anchorY += 5); anchorY <= 10) {
          for (let baseX = -100; (baseX += 50); baseX <= 100) {
            for (let baseY = -100; (baseY += 50); baseY <= 100) {
              for (let rotation = -390; (rotation += 30); rotation < 390) {
                const baseProps: SpriteBaseProps = {
                  opacity: 1,
                  scaleX,
                  scaleY,
                  anchorX,
                  anchorY,
                  x: baseX,
                  y: baseY,
                  rotation,
                };

                const getLocal = getLocalCoordsForSprite(baseProps);
                const getParent = getParentCoordsForSprite(baseProps);

                for (let x = -20; (x += 5); x <= 20) {
                  for (let y = -20; (y += 5); y <= 20) {
                    // parent -> local -> parent
                    const { x: x2, y: y2 } = getParent(getLocal({ x, y }));
                    expect(x2).toBeCloseTo(x);
                    expect(y2).toBeCloseTo(y);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
