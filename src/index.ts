import { Client } from "discord.js";
import { commandGroup } from "./commands";
import { makeMsg, registerCommands, updateSettings } from "./utils";
import { DateTime } from "luxon";
import { getAllItems } from "./db";

const client = new Client({ intents: [] });

client.once("ready", async () => {
    console.log("app is online!");
    await registerCommands();

    const testingRn = false;
    const intervalMs = testingRn ? 10000 : 12 * 60 * 60 * 1000; // 12 hours

    async function run() {
        for (const config of await getAllItems()) {
            const { channelId } = config;

            try {
                const channel = await client.channels.fetch(channelId);
                if (!channel || !channel.isSendable()) continue;

                const { embed, attachment } = await makeMsg();

                await channel.send({
                    embeds: [embed],
                    files: [attachment],
                });
            } catch {}
        }
    }

    const now = DateTime.utc();
    const nextTriggerHour = now.hour < 12 ? 12 : 24;
    const nextTrigger = now.set({
        hour: nextTriggerHour,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    const delay = nextTrigger.diff(now).toMillis();

    console.log(
        "delay until next run:",
        (delay / (1000 * 60 * 60)).toFixed(2),
        "hours"
    );

    await run();

    setTimeout(
        () => {
            run();
            setInterval(run, intervalMs);
        },
        testingRn ? 0 : delay
    );
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = commandGroup.get(interaction.commandName);

        if (!command) return;
        await command.run(interaction);
    } else if (interaction.isChannelSelectMenu()) {
        await updateSettings(interaction);
    }
});

client.login(process.env.DISCORD_CLIENT_TOKEN);
