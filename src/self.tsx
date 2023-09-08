import { ActionPanel, List, Action, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { connect, Game } from "./utils";

interface State {
  game?: Game;
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
      });
    })();
  }, []);

  return (
    <List isLoading={!state.game}>
      {(() => {
        if (!state.game) {
          return;
        }
        return (
          <List.Item
            key="desk"
            title="Teleport to desk"
            icon="🪑"
            actions={
              <ActionPanel>
                <Action key="teleport" title="Teleport" onAction={() => state.game!.teleportToDesk()} />
              </ActionPanel>
            }
          />
        );
      })()}
    </List>
  );
}
