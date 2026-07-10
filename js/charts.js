

function drawCharts() {
  if (!state) return;
  drawBar("phaseChart", state.phases.map(p => p.phaseNo), state.phases.map(p => p.progress), "%");
  drawBar("teamChart", state.team.map(t => t.name), state.team.map(t => t.tasks), "");
  drawBar("moduleChart", state.modules.slice(0, 10).map(m => m.name), state.modules.slice(0, 10).map(m => m.progress), "%");
}

function drawBar(id, labels, data, suffix) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = 260 * ratio;

  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);

  const w = rect.width;
  const h = 260;
  const p = 42;
  const max = Math.max(100, ...data);

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#eef2f6";
  for (let i = 0; i <= 5; i++) {
    const y = p + i * (h - p * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(p, y);
    ctx.lineTo(w - p, y);
    ctx.stroke();
  }

  const step = (w - p * 2) / data.length;
  const bw = step * 0.52;

  data.forEach((value, i) => {
    const x = p + i * step + (step - bw) / 2;
    const bh = (h - p * 2) * (value / max);
    const y = h - p - bh;

    ctx.fillStyle = "#0078D4";
    roundRect(ctx, x, y, bw, bh, 8);
    ctx.fill();

    ctx.fillStyle = "#101828";
    ctx.font = "bold 12px Segoe UI";
    ctx.fillText(String(value) + suffix, x, y - 8);

    ctx.save();
    ctx.fillStyle = "#667085";
    ctx.font = "11px Segoe UI";
    ctx.translate(x, h - 14);
    ctx.rotate(-0.55);
    ctx.fillText(labels[i], 0, 0);
    ctx.restore();
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}
