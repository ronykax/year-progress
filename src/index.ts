import "dotenv/config";
import { Client } from "discord.js";
import { commandGroup } from "./commands";
import { getAllItems } from "./db";
import {
    getDelay,
    getYearProgress,
    makeMsg,
    registerCommands,
    updateSettings,
} from "./utils";

const client = new Client({ intents: [] });
const testing = process.env.TESTING === "yes" ? true : false;

let lastProgress = -1; // invalid progress

client.once("ready", async () => {
    await registerCommands();
    console.log(testing ? "testing" : "not testing");

    async function run() {
        for (const config of getAllItems()) {
            const { channelId } = config;

            const { progress: yearProgress, start } = getYearProgress();
            // lastProgress = progress;

            if (yearProgress > lastProgress) {
                try {
                    // only sending if progress was updated
                    const channel = await client.channels.fetch(channelId);
                    if (!channel || !channel.isSendable()) continue;

                    const { container, yearProgressAttachment } = await makeMsg(
                        yearProgress,
                        // 50, // month progress
                        start
                    );

                    await channel.send({
                        components: [container],
                        files: [yearProgressAttachment],
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
    }

    const interval = testing ? 30000 : 3 * 60 * 60 * 1000; // 30 seconds or 3 hours

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

client.login(process.env.DISCORD_CLIENT_TOKEN);
