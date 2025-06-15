import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types";
import { deleteEntry } from "../utils/db";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("unsubscribe")
        .setDescription("Unsubscribe from year progress updates"),
    async run(interaction) {
        deleteEntry(`${interaction.guildId}`);

        await interaction.reply({
            content:
                "You will no longer receive year progress updates in this server.",
            flags: ["Ephemeral"],
        });
    },
};

export default command;
