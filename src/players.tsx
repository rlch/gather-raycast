import { Player, PlayerStatusOption } from "@gathertown/gather-game-client";
import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { Game, connect } from "./utils";

interface State {
  game?: Game;
  players?: Player[];
}

function status(p: Player): string {
  var status = "";
  switch (p.status) {
    case PlayerStatusOption.Available:
      status = "🟢";
      break;
    case PlayerStatusOption.DoNotDisturb:
      status = "🔴";
      break;
    case PlayerStatusOption.Busy:
      status = "🟡";
      break;
  }
  return status + " " + p.textStatus;
}

export default function Command() {
  const [state, setState] = useState<State>({});
  const prefs = getPreferenceValues<Preferences>();

  useEffect(() => {
    (async () => {
      if (state.game) {
        return;
      }
      const game = await connect(prefs);
      setState({
        game: game,
        players: Object.values(game.players),
      });
    })();
  }, []);

  return (
    <List isLoading={!state.players}>
      {state.players?.map((p) => (
        <List.Item
          key={p.id}
          title={p.name}
          subtitle={status(p)}
          icon={p.profileImageUrl}
          actions={
            <ActionPanel>
              {(() => {
                const game = state.game!;
                const actions = [<Action key="wave" title="Wave" onAction={() => game.wave(p.id)} />];
                if (prefs.allowTeleport) {
                  actions.unshift(<Action key="teleport" title="Teleport" onAction={() => game.teleportToPlayer(p)} />);
                }
                return actions;
              })()}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
