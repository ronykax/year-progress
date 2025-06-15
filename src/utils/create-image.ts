import Canvas from "@napi-rs/canvas";

export default async function createImage(progress: number) {
    const green = "#35ed7e";
    const gray = "#1f1f1f";
    const black = "rgba(0,0,0,0.5)";

    const columns = 20;
    const rows = 5;
    const cellSize = 20;
    const gap = 2;

    const canvasWidth = columns * cellSize + gap * columns - gap;
    const canvasHeight = rows * cellSize + gap * rows - gap;
    const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const full = Math.floor(progress);
    const partial = progress - full;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const i = row * columns + col;
            const x = col * (cellSize + gap);
            const y = row * (cellSize + gap);

            if (i < full) {
                ctx.fillStyle = green;
                ctx.fillRect(x, y, cellSize, cellSize);
            } else if (i === full && partial > 0) {
                const greenWidth = cellSize * partial;

                ctx.fillStyle = green;
                ctx.fillRect(x, y, greenWidth, cellSize);

                ctx.fillStyle = gray;
                ctx.fillRect(
                    x + greenWidth,
                    y,
                    cellSize - greenWidth,
                    cellSize
                );
            } else {
                ctx.fillStyle = gray;
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }

    return await canvas.encode("png");
}
