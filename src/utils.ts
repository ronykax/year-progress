import "dotenv/config";
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
        getEnv("DISCORD_CLIENT_TOKEN")
    );

    await rest.put(
        Routes.applicationCommands(
            getEnv("DISCORD_CLIENT_ID")
            // getEnv("DISCORD_GUILD_ID")
        ),
        { body: commandsArray }
    );
}

// async function drawGrid(progress: number) {
//     const green = "#35ed7e";
//     const gray = "#1f1f1f";
//     const black = "rgba(0,0,0,0.5)";

//     const gridSize = 10;
//     const cellSize = 20;
//     const gap = 2;

//     const canvasSize = cellSize * gridSize + gap * gridSize - gap;
//     const canvas = Canvas.createCanvas(canvasSize, canvasSize);
//     const ctx = canvas.getContext("2d");

//     ctx.fillStyle = black;
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     const full = Math.floor(progress);
//     const partial = progress - full;

//     for (let row = 0; row < gridSize; row++) {
//         for (let col = 0; col < gridSize; col++) {
//             const i = row * gridSize + col;
//             const x = col * (cellSize + gap);
//             const y = row * (cellSize + gap);

//             if (i < full) {
//                 ctx.fillStyle = green;
//                 ctx.fillRect(x, y, cellSize, cellSize);
//             } else if (i === full && partial > 0) {
//                 const greenWidth = cellSize * partial;

//                 ctx.fillStyle = green;
//                 ctx.fillRect(x, y, greenWidth, cellSize);

//                 ctx.fillStyle = gray;
//                 ctx.fillRect(
//                     x + greenWidth,
//                     y,
//                     cellSize - greenWidth,
//                     cellSize
//                 );
//             } else {
//                 ctx.fillStyle = gray;
//                 ctx.fillRect(x, y, cellSize, cellSize);
//             }
//         }
//     }

//     return await canvas.encode("png");
// }

async function drawGrid(progress: number) {
    const green = "#35ed7e";
    const gray = "#1f1f1f";
    const black = "rgba(0,0,0,0.5)";

    const columns = 20;
    const rows = 5;
    const cellSize = 20;
    const gap = 2;

    const canvasWidth = columns * cellSize + gap * columns - gap;
    const canvasHeight = rows * cellSize + gap * rows - gap;
    const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const full = Math.floor(progress);
    const partial = progress - full;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const i = row * columns + col;
            const x = col * (cellSize + gap);
            const y = row * (cellSize + gap);

            if (i < full) {
                ctx.fillStyle = green;
                ctx.fillRect(x, y, cellSize, cellSize);
            } else if (i === full && partial > 0) {
                const greenWidth = cellSize * partial;

                ctx.fillStyle = green;
                ctx.fillRect(x, y, greenWidth, cellSize);

                ctx.fillStyle = gray;
                ctx.fillRect(
                    x + greenWidth,
                    y,
                    cellSize - greenWidth,
                    cellSize
                );
            } else {
                ctx.fillStyle = gray;
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }

    return await canvas.encode("png");
}

export async function makeMsg(progress: Progress) {
    const buffer = await drawGrid(progress.year);

    const attachment = new AttachmentBuilder(buffer, {
        name: "year-progress.png",
    });

    const smallSeprator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${progress.currentYear} is ${progress.year}% complete**`
            )
        )
        .addSeparatorComponents(smallSeprator)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `- ${progress.day.current} / ${progress.day.total} days left\n- Week ${progress.week.current} / ${progress.week.total}\n- June (${progress.month} / 12)\n_ _`
            )
        )
        // .addSeparatorComponents(smallSeprator)
        .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL(
                    `attachment://${attachment.name}`
                )
            )
        );

    return {
        attachment,
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

interface Progress {
    year: number;
    day: { current: number; total: number };
    week: { current: number; total: number };
    month: number;
    currentYear: number;
}

export function getProgress(): Progress {
    const now = DateTime.utc();
    const startOfYear = DateTime.utc(now.year, 1, 1);
    const endOfYear = DateTime.utc(now.year + 1, 1, 1);

    const yearProgress = Number(
        (
            (now.diff(startOfYear).milliseconds /
                endOfYear.diff(startOfYear).milliseconds) *
            100
        ).toFixed(2)
    );

    const dayOfYear = now.ordinal;
    const totalDays = endOfYear.diff(startOfYear, "days").days;

    const currentWeek = now.weekNumber;
    const totalWeeks = DateTime.utc(now.year, 12, 31).weekNumber;

    const currentMonth = now.month;

    return {
        year: yearProgress,
        day: {
            current: dayOfYear,
            total: totalDays,
        },
        week: {
            current: currentWeek,
            total: totalWeeks,
        },
        month: currentMonth,
        currentYear: startOfYear.year,
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

export function getEnv(name: string) {
    const result = process.env[name];
    if (!result) throw new Error(`invalid environment variable: ${name}`);

    return result;
}
