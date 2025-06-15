import {
    AttachmentBuilder,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from "discord.js";
import type { Progress } from "../types";
import createImage from "./create-image";

export default async function createMsg(progress: Progress) {
    const buffer = await createImage(progress.year);

    const attachment = new AttachmentBuilder(buffer, {
        name: "year-progress.png",
    });

    const separator = new SeparatorBuilder().setDivider(false);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${progress.currentYear} is ${progress.year}% complete**`
            )
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `- ${progress.day.current} / ${progress.day.total} days left\n- Week ${progress.week.current} / ${progress.week.total}\n- June (${progress.month} / 12)`
            )
        )
        .addSeparatorComponents(
            separator.setSpacing(SeparatorSpacingSize.Small)
        )
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
