import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Collection,
    ContainerBuilder,
    PermissionFlagsBits,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SlashCommandBuilder,
    TextDisplayBuilder,
    type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { setChannelId } from "./db";

export interface Command {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export const commandGroup = new Collection<string, Command>();

export const commands: Command[] = [
    {
        data: new SlashCommandBuilder()
            .setName("about")
            .setDescription("About Year Progress app"),
        async run(interaction) {
            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        "Progress bar for the current year in UTC.\nUse `/setup [channel]` to start getting updates!"
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
    },
    {
        data: new SlashCommandBuilder()
            .setName("setup")
            .setDescription("Setup Year Progress in your server!")
            .addChannelOption((option) =>
                option
                    .setName("channel")
                    .setDescription("Pick a channel")
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async run(interaction) {
            const channelId = interaction.options.getChannel(
                "channel",
                true
            ).id;
            setChannelId(interaction.guildId, channelId);

            await interaction.reply({
                content: `Now using <#${channelId}> for year progress updates!`,
                flags: ["Ephemeral"],
            });
        },
    },
];
