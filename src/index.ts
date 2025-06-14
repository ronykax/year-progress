console.clear();

import "dotenv/config";
import { Client } from "discord.js";
import { commandGroup } from "./commands";
import { getAllItems } from "./db";
import {
    getDelay,
    getEnv,
    getProgress,
    makeMsg,
    registerCommands,
    updateSettings,
} from "./utils";

const client = new Client({ intents: [] });
const testing = getEnv("TESTING") === "yes" ? true : false;

client.once("ready", async () => {
    await registerCommands();
    console.log(testing ? "testing" : "not testing");

    async function run() {
        for (const config of getAllItems()) {
            const { channelId } = config;
            const progress = getProgress();

            try {
                // only sending if progress was updated
                const channel = await client.channels.fetch(channelId);
                if (!channel || !channel.isSendable()) continue;

                const { container, attachment } = await makeMsg(progress);

                await channel.send({
                    components: [container],
                    files: [attachment],
                    flags: ["IsComponentsV2"],
                });
            } catch (error) {
                if (testing)
                    console.error(
                        `!!! couldn't send to channel ${channelId}: `,
                        error
                    );
            }
        }
    }

    const interval = testing ? 30000 : 12 * 60 * 60 * 1000; // 30 seconds or 3 hours

    setTimeout(
        () => {
            run();
            setInterval(run, interval);
        },
        testing ? 0 : getDelay()
    );

    console.log("app is online!");
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

client.login(getEnv("DISCORD_CLIENT_TOKEN"));
