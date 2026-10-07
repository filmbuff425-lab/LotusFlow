// Architecture dimensions grow independently from the fixed object anchors.
// The floor stays at y=0, so the room grows outward and upward around its contents.
export const studioLayout = Object.freeze({
  architectureScale: [2.3625, 1.701, 2.3415],
  shell: [83.5275, 35.28, 68.9535],
  center: [0, 16.8, 0],
  // Keep these display and furniture anchors at their approved positions.
  rightWall: 39.31,
  leftWall: -39.31,
  // Wall-mounted pieces follow the enlarged pane; desk anchors stay fixed.
  mvWallX: -17.47 * 2.3625 + .48,
  mediaConsoleX: -17.47 * 2.3625 + 2.40,
  backWall: -32.2681,
  posterX: 39.22,
  cdPlayerX: 39.09,
  shelf: [27.0, 0, -29.08],
  listeningZ: 0.0,
  // An L-shaped work area, with a separate inward-facing lounge at front left.
  synths: [24.4, 0, 9.5],
  synthRotation: -1.42,
  lounge: [-24.0, 0, 20.0],
  loungeRotation: 1.76,
  loungeScale: [1.5246, 1.5015, 1.5246],
  coffeeTable: [-17.6, 0, 22.0],
});
