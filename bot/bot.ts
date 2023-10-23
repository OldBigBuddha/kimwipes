import { createBot } from "@discordeno";

import { Secret } from "@utils/secret";

import { slashCommandsInfo } from "./commands/index.ts";
import { events } from "./events/index.ts";

export const BOT = createBot({
  token: Secret.DISCORD_TOKEN,
  events: events,
});

// コマンド登録
for (const command of slashCommandsInfo) {
  await BOT.helpers.createGuildApplicationCommand(command, Secret.GUILD_ID);
}
await BOT.helpers.upsertGuildApplicationCommands(
  Secret.GUILD_ID,
  slashCommandsInfo,
);
