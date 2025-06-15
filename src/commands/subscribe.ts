import {
    ChannelType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types";
import { setChannelId } from "../utils/db";
import getProgress from "../utils/get-progress";
import createMsg from "../utils/create-msg";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("subscribe")
        .setDescription("Setup Year Progress in your server!")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Pick a channel")
                .setRequired(true)
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement,
                    ChannelType.PublicThread
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async run(interaction) {
        const channelId = interaction.options.getChannel("channel", true).id;
        const channel = await interaction.client.channels.fetch(channelId);

        try {
            if (!channel || !channel.isSendable()) return;

            const progress = getProgress();
            const { container, attachment } = await createMsg(progress);

            await channel.send({
                components: [container],
                files: [attachment],
                flags: ["IsComponentsV2"],
            });

            setChannelId(`${interaction.guildId}`, channelId);

            await interaction.reply({
                content: `Now using <#${channelId}> for year progress updates!`,
                flags: ["Ephemeral"],
            });
        } catch (error) {
            await interaction.reply({
                content: `Something went wrong! Are you sure I have permission to send messages in <#${channelId}>?\n-# If you believe this is a mistake, please report it in our [support server](<https://discord.gg/jvWWH8nZxp>).`,
                flags: ["Ephemeral"],
            });
        }
    },
};

export default command;
