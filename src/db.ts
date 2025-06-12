import { readFileSync, writeFileSync } from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "db.json");

interface GuildSettings {
    guildId: string;
    channelId: string;
}

function readDB(): GuildSettings[] {
    const raw = readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
}

function writeDB(data: GuildSettings[]) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// export function getChannelId(guildId: string | null): string | null {
//     const db = readDB();
//     const record = db.find((entry) => entry.guildId === guildId);

//     return record ? record.channelId : null;
// }

export function setChannelId(
    guildId: string | null,
    channelId: string | undefined
) {
    if (!guildId) return new Error("provide a guild ID!");
    if (!channelId) return new Error("provide a channel ID!");

    const db = readDB();
    const existing = db.find((entry) => entry.guildId === guildId);

    if (existing) {
        existing.channelId = channelId;
    } else {
        db.push({ guildId, channelId });
    }

    writeDB(db);
}
