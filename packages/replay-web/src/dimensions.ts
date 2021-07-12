/**
 * Three options for rendering a game in a browser:
 *
 * 1. use the game coordinates as pixel width and height in window
 * 2. scale the game up so that it takes the maximum width and height it can in
 *    window
 * 3. scale the game up so that pixels remain proportional (good for pixel art)
 */
export type Dimensions = "game-coords" | "scale-up" | "scale-up-proportional";
