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

    const smallSeprator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**${progress.currentYear} is ${progress.year}% complete**`
            )
        )
        .addSeparatorComponents(smallSeprator)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `- ${progress.day.current} / ${progress.day.total} days left\n- Week ${progress.week.current} / ${progress.week.total}\n- June (${progress.month} / 12)\n_ _`
            )
        )
        // .addSeparatorComponents(smallSeprator)
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
