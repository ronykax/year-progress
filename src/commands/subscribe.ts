import {
    ChannelType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../types";
import { setChannelId } from "../utils/db";
import getProgress from "../utils/get-progress";
import createMsg from "../utils/create-msg";
import testing from "../utils/testing";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("subscribe")
        .setDescription("Subscribe to year progress updates")
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
                content: `I will now use <#${channelId}> to post year progress updates!`,
                flags: ["Ephemeral"],
            });
        } catch (error) {
            if (testing) console.error(error);

            await interaction.reply({
                content: `Something went wrong! Are you sure I have permission to send messages in <#${channelId}>?\n-# If you believe this is a mistake, please report it in our [support server](<https://discord.gg/jvWWH8nZxp>).`,
                flags: ["Ephemeral"],
            });
        }
    },
};

export default command;
