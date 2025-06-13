import {
    AttachmentBuilder,
    ChannelSelectMenuInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    REST,
    Routes,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { commandGroup, commands } from "./commands";
import { DateTime } from "luxon";
import { setChannelId } from "./db";
import Canvas from "@napi-rs/canvas";

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

async function drawYearProgressBar(progress: number) {
    const canvas = Canvas.createCanvas(320, 36);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(224, 227, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgb(88, 101, 242)";
    ctx.fillRect(0, 0, (progress / 100) * canvas.width, canvas.height);

    return await canvas.encode("png");
}

// async function drawMonthProgressBar(progress: number) {
//     const canvas = Canvas.createCanvas(72, 72);
//     const ctx = canvas.getContext("2d");

//     const centerX = ctx.canvas.width / 2;
//     const centerY = ctx.canvas.height / 2;
//     const radius = Math.min(centerX, centerY) - 6; // padding
//     const startAngle = -Math.PI / 2;
//     const endAngle = startAngle + 2 * Math.PI * (progress / 100);

//     // Background circle
//     ctx.strokeStyle = "rgb(224, 227, 255)";
//     ctx.lineWidth = 10;
//     ctx.beginPath();
//     ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
//     ctx.stroke();

//     // Progress arc
//     ctx.strokeStyle = "rgb(88, 101, 242)";
//     ctx.beginPath();
//     ctx.arc(centerX, centerY, radius, startAngle, endAngle);
//     ctx.stroke();

//     return await canvas.encode("png");
// }

export async function makeMsg(
    yearProgress: number,
    // monthProgress: number,
    start: DateTime
) {
    const yearProgressBuffer = await drawYearProgressBar(yearProgress);
    // const monthProgressBuffer = await drawMonthProgressBar(monthProgress);

    const yearProgressAttachment = new AttachmentBuilder(yearProgressBuffer, {
        name: "year-progress.png",
    });

    // const monthProgressAttachment = new AttachmentBuilder(monthProgressBuffer, {
    //     name: "month-progress.png",
    // });

    const smallSeprator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${start.year} is ${yearProgress}% complete**`
            )
        )
        .addSeparatorComponents(smallSeprator)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `- 133 / 365 days left\n- Week 24 / 52\n- June (6 / 12)`
            )
        )
        .addSeparatorComponents(smallSeprator)
        .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(
                    `attachment://${yearProgressAttachment.name}`
                )
            )
        );

    return {
        yearProgressAttachment,
        // monthProgressAttachment,
        container,
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

export function getYearProgress() {
    const now = DateTime.utc();
    const start = DateTime.utc(now.year, 1, 1);
    const end = DateTime.utc(now.year + 1, 1, 1);

    const progress = Math.trunc(
        (now.diff(start).milliseconds / end.diff(start).milliseconds) * 100
    );

    return {
        progress,
        start,
    };
}

export function getDelay() {
    const now = DateTime.utc();
    const nextTriggerHour = now.hour < 12 ? 12 : 24;
    const nextTrigger = now.set({
        hour: nextTriggerHour,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    return nextTrigger.diff(now).toMillis();
}
