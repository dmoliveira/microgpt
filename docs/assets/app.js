function drawAxes(ctx, width, height, pad) {
  ctx.strokeStyle = "#8f96a3";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.stroke();
}

function drawLossChart() {
  const canvas = document.getElementById("lossChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = 30;

  const loss = [
    3.9, 3.4, 3.0, 2.7, 2.45, 2.32, 2.15, 2.02, 1.96, 1.9, 1.84, 1.8,
  ];

  ctx.clearRect(0, 0, width, height);
  drawAxes(ctx, width, height, pad);

  ctx.strokeStyle = "#1f7a8c";
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let i = 0; i < loss.length; i += 1) {
    const x = pad + (i / (loss.length - 1)) * (width - 2 * pad);
    const norm = (loss[i] - 1.7) / (4.0 - 1.7);
    const y = height - pad - norm * (height - 2 * pad);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#334155";
  ctx.font = "12px IBM Plex Mono";
  ctx.fillText("step", width - 48, height - 10);
  ctx.save();
  ctx.translate(10, 20);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("loss", 0, 0);
  ctx.restore();
}

function drawAttentionHeatmap() {
  const canvas = document.getElementById("attnHeatmap");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const cols = 8;
  const rows = 8;
  const cellW = width / cols;
  const cellH = height / rows;

  const data = [
    [0.8, 0.1, 0.05, 0.03, 0.01, 0.005, 0.003, 0.002],
    [0.3, 0.5, 0.1, 0.05, 0.03, 0.01, 0.005, 0.005],
    [0.1, 0.2, 0.4, 0.15, 0.08, 0.04, 0.02, 0.01],
    [0.06, 0.1, 0.2, 0.36, 0.16, 0.07, 0.03, 0.02],
    [0.03, 0.05, 0.09, 0.2, 0.35, 0.15, 0.08, 0.05],
    [0.02, 0.04, 0.05, 0.09, 0.22, 0.33, 0.15, 0.1],
    [0.01, 0.02, 0.04, 0.08, 0.15, 0.24, 0.31, 0.15],
    [0.01, 0.02, 0.03, 0.06, 0.1, 0.16, 0.25, 0.37],
  ];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const v = data[r][c];
      const hue = 190 - Math.floor(v * 130);
      const light = 95 - Math.floor(v * 55);
      ctx.fillStyle = `hsl(${hue}, 70%, ${light}%)`;
      ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      ctx.strokeStyle = "#ffffff99";
      ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
    }
  }
}

async function loadCoreCode() {
  const el = document.getElementById("coreCode");
  if (!el) return;
  try {
    const response = await fetch("assets/microgpt.py", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load source file");
    const text = await response.text();
    el.textContent = text;
  } catch (_error) {
    el.textContent = "Unable to load local source. Open docs/assets/microgpt.py directly.";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadCoreCode();
  drawLossChart();
  drawAttentionHeatmap();
});
