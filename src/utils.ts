import {
    AttachmentBuilder,
    ChannelSelectMenuInteraction,
    EmbedBuilder,
    REST,
    Routes,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { commandGroup, commands } from "./commands";
import { DateTime } from "luxon";
import Canvas from "@napi-rs/canvas";
import { setChannelId } from "./db";

export async function registerCommands() {
    let commandsArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const command of commands) {
        commandsArray.push(command.data.toJSON());
        commandGroup.set(command.data.name, command);
    }

    const rest = new REST({ version: "10" }).setToken(
        process.env.DISCORD_CLIENT_TOKEN!
    );

    await rest.put(
        Routes.applicationCommands(
            process.env.DISCORD_CLIENT_ID!
            // process.env.DISCORD_GUILD_ID!
        ),
        { body: commandsArray }
    );
}

async function drawProgress(progress: number) {
    const canvas = Canvas.createCanvas(320, 36);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(224, 227, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgb(88, 101, 242)";
    ctx.fillRect(0, 0, (progress / 100) * canvas.width, canvas.height);

    // ctx.font = "10px bold Arial";
    // ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    // ctx.fillText("2025 Progress Bar", 216, 20);

    const buffer = await canvas.encode("png");

    return new AttachmentBuilder(buffer, {
        name: "year-progress.png",
    });
}

export async function makeMsg() {
    const now = DateTime.utc();
    const start = DateTime.utc(now.year, 1, 1);
    const end = DateTime.utc(now.year + 1, 1, 1);

    const progress =
        (now.diff(start).milliseconds / end.diff(start).milliseconds) * 100;

    const attachment = await drawProgress(progress);

    const embed = new EmbedBuilder()
        .setTitle(`${start.year} is **${progress.toFixed(0)}%** complete`)
        .setImage("attachment://year-progress.png");

    return {
        attachment,
        embed,
    };
}

export async function updateSettings(
    interaction: ChannelSelectMenuInteraction
) {
    const chosenChannelId = interaction.values[0];
    setChannelId(interaction.guildId, chosenChannelId);

    await interaction.reply({
        content: `Year progress updates will now be sent to <#${chosenChannelId}>!`,
        flags: ["Ephemeral"],
    });
}
