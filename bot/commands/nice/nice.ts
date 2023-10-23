import {
  ApplicationCommandOptionTypes,
  CreateSlashApplicationCommand,
  InteractionResponseTypes,
} from "@discordeno";
import { Secret } from "@utils/secret";
import { kv } from "@storage/kv";
import { RunCommand } from "../type.ts";

const KEY_NICE = "nice_key" as const;

export const commandInfo: CreateSlashApplicationCommand = {
  name: "nice",
  description: "Nice!",
  options: [{
    type: ApplicationCommandOptionTypes.User,
    name: "target",
    description: "Nice person",
    required: true,
    nameLocalizations: {
      ja: "対象者",
    },
  }],
};

async function findEntry<T>(
  keys: Deno.KvKeyPart[],
): Promise<Deno.KvEntryMaybe<T> | undefined> {
  return await kv.get<T>([KEY_NICE, ...keys]);
}

async function setEntry(
  keys: Deno.KvKeyPart[],
  value: unknown,
): Promise<Deno.KvCommitResult> {
  return await kv.set([KEY_NICE, ...keys], value);
}

export const runCommand: RunCommand = async (bot, interaction) => {
  // validation
  const options = interaction.data?.options;
  if (options == null) {
    throw Error("invalid request");
  }
  const target = options[0].value;
  if (target == null || typeof target !== "string") {
    throw Error("no user passed");
  }

  const member = await bot.helpers.getMember(Secret.GUILD_ID, target);
  const entry = await findEntry<number>([member.id]);
  const newPoint = entry?.value != null ? entry.value + 1 : 1;
  await setEntry([member.id], newPoint);

  await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
    type: InteractionResponseTypes.ChannelMessageWithSource,
    data: {
      content: `Nice! ${
        member.nick ?? member.user?.username
      }\ncurrent point: ${newPoint}`,
    },
  });
};
