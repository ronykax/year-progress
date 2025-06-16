import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    inlineCode,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SlashCommandBuilder,
    TextDisplayBuilder,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("about")
        .setDescription("About Year Progress"),
    async run(interaction) {
        const latency = Date.now() - interaction.createdTimestamp;

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `Dividing the year into hundred pieces.\n` +
                        `Use ${inlineCode(
                            "/subscribe [channel]"
                        )} to start getting updates!\n\n` +
                        `-# *~ ${latency}ms*`
                )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(false)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addActionRowComponents(
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setLabel("Website")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://yearprogress.ronykax.xyz")
                        .setEmoji("🌐")
                ),
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setLabel("Report a Problem")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://discord.gg/jvWWH8nZxp")
                        .setEmoji("🐞")
                )
            );

        await interaction.reply({
            components: [container],
            flags: ["Ephemeral", "IsComponentsV2"],
        });
    },
};

export default command;
