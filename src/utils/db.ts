import { readFileSync, writeFileSync } from "fs";
import path from "path";
import testing from "./testing";

const DB_PATH = path.join(
    __dirname,
    "..",
    "..",
    "db",
    testing ? "test.json" : "main.json"
);

interface GuildSettings {
    guildId: string;
    channelId: string;
}

function readDB(): GuildSettings[] {
    const raw = readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
}

function writeDB(data: GuildSettings[]) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 4));
}

// export function getChannelId(guildId: string | null): string | null {
//     const db = readDB();
//     const record = db.find((entry) => entry.guildId === guildId);

//     return record ? record.channelId : null;
// }

export function setChannelId(guildId: string, channelId: string) {
    const db = readDB();
    const existing = db.find((entry) => entry.guildId === guildId);

    if (existing) {
        existing.channelId = channelId;
    } else {
        db.push({ guildId, channelId });
    }

    writeDB(db);
}

export function getAllItems() {
    return readDB();
}
