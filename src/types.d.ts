import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface Progress {
    year: number;
    day: { current: number; total: number };
    week: { current: number; total: number };
    month: number;
    currentYear: number;
}