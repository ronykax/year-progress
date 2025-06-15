import { readdirSync } from "fs";
import path from "path";
import type { Command } from "../types";
import {
    REST,
    Routes,
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import getEnv from "./get-env";
import commandGroup from "./command-group";

export default async function registerCommands() {
    let body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = readdirSync(commandsPath);

    for (const file of commandFiles) {
        const commandPath = path.join(commandsPath, file);
        const command = (await import(commandPath)).default as Command;

        commandGroup.set(command.data.name, command);
        body.push(command.data.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(
        getEnv("DISCORD_CLIENT_TOKEN")
    );

    await rest.put(Routes.applicationCommands(getEnv("DISCORD_CLIENT_ID")), {
        body,
    });

    console.log(`registered ${body.length} commands`);
}
