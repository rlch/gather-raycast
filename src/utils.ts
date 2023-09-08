import { Game as gatherGame, Player, WirePoint } from "@gathertown/gather-game-client";

export interface Preferences {
  spaceId: string;
  apiKey: string;
}

export class Game extends gatherGame {
  closestToPlayer(coords: WirePoint[]): WirePoint {
    const p = this.getMyPlayer();
    return coords.sort((c1, c2) => dist(c1, p) - dist(c2, p))[0];
  }

  teleportToPlayer(player: Player) {
    this.teleport(player.map, player.x, player.y, this.getMyPlayer().id);
  }

  teleportToDesk() {
    const p = this.getMyPlayer();
    const desk = p.deskInfo;
    if (!desk.deskId) {
      throw new Error("Player has no desk");
    }
    const map = this.partialMaps[p.map];
    if (!map || !map.nooks) {
      throw new Error("Map not found");
    }
    const nook = map.nooks[desk.deskId];
    const deskCoords = this.closestToPlayer(nook.nookCoords.coords);
    this.teleport(p.map, deskCoords.x, deskCoords.y, p.id);
  }
}

function dist(a: WirePoint, b: WirePoint) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export async function connect(p: Preferences): Promise<Game> {
  Object.assign(global, { WebSocket: require("ws") });

  const game = new Game(p.spaceId, () => {
    return Promise.resolve({ apiKey: p.apiKey });
  });

  await new Promise<void>((resolve) => {
    game.connect();
    game.subscribeToConnection((connected) => {
      if (connected) {
        resolve();
      }
    });
  });

  await game.waitForInit();
  return game;
}
