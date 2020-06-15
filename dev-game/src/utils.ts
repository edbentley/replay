import { Bullet } from "./PlayStage";

export function bulletX(b: Bullet, extrapolatedDistance = 0) {
  return Math.round(
    -(b.distance + extrapolatedDistance) *
      Math.cos((b.rotation * Math.PI) / 180)
  );
}

export function bulletY(
  b: Bullet,
  fullHeight: number,
  extrapolatedDistance = 0
) {
  return Math.round(
    -fullHeight +
      (b.distance + extrapolatedDistance) *
        Math.sin((b.rotation * Math.PI) / 180)
  );
}
