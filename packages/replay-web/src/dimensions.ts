/**
 * Two options for rendering a game in a browser, either:
 *
 * 1. use the game coordinates as pixel width and height in window
 * 2. scale the game up so that it takes the maximum width and height it can in
 *    window
 */
export type Dimensions = "game-coords" | "scale-up";
