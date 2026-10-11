// Architecture dimensions grow independently from the fixed object anchors.
// The floor stays at y=0, so the room grows outward and upward around its contents.
export const studioLayout = Object.freeze({
  architectureScale: [2.3625, 1.701, 2.3415],
  shell: [83.5275, 35.28, 68.9535],
  center: [0, 16.8, 0],
  // Keep the room and desk anchors fixed; wall displays have independent anchors.
  rightWall: 39.31,
  leftWall: -39.31,
  // Wall-mounted pieces follow the enlarged pane; desk anchors stay fixed.
  mvWallX: 17.47 * 2.3625 - .48,
  mediaConsoleX: -17.47 * 2.3625 + 2.40,
  backWall: -32.2681,
  posterX: 39.22,
  cdPlayerX: -39.09,
  shelf: [30.2, 0, -29.08],
  guitar: [35.3, 0, -25.1],
  amplifierRack: [37.9, 0, -9.0],
  amplifierRackRotation: -Math.PI / 2,
  listeningZ: 0.0,
  // An L-shaped work area, with a separate inward-facing lounge at front left.
  synths: [24.4, 0, 9.5],
  synthRotation: -1.42,
  lounge: [-24.0, 0, 20.0],
  loungeRotation: 1.76,
  loungeScale: [1.5246, 1.5015, 1.5246],
  coffeeTable: [-17.6, 0, 22.0],
});
