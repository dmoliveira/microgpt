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

const CODE_MAP = {
  dataset: {
    title: "Dataset bootstrapping",
    code: `if not os.path.exists('input.txt'):
    import urllib.request
    urllib.request.urlretrieve(names_url, 'input.txt')
docs = [line.strip() for line in open('input.txt') if line.strip()]
random.shuffle(docs)`,
  },
  tokenizer: {
    title: "Tokenizer and BOS",
    code: `uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1`,
  },
  autograd: {
    title: "Autograd backward pass",
    code: `def backward(self):
    topo = []
    visited = set()
    ...
    self.grad = 1
    for v in reversed(topo):
        for child, local_grad in zip(v._children, v._local_grads):
            child.grad += local_grad * v.grad`,
  },
  transformer: {
    title: "Transformer forward block",
    code: `q = linear(x, state_dict[f'layer{li}.attn_wq'])
k = linear(x, state_dict[f'layer{li}.attn_wk'])
v = linear(x, state_dict[f'layer{li}.attn_wv'])
attn_weights = softmax(attn_logits)
x = linear(x_attn, state_dict[f'layer{li}.attn_wo'])
x = [a + b for a, b in zip(x, x_residual)]`,
  },
  train: {
    title: "Training loop and Adam",
    code: `loss = (1 / n) * sum(losses)
loss.backward()

for i, p in enumerate(params):
    m[i] = beta1 * m[i] + (1 - beta1) * p.grad
    v[i] = beta2 * v[i] + (1 - beta2) * p.grad ** 2
    p.data -= lr_t * m_hat / (v_hat ** 0.5 + eps_adam)
    p.grad = 0`,
  },
  sample: {
    title: "Autoregressive sampling",
    code: `for pos_id in range(block_size):
    logits = gpt(token_id, pos_id, keys, values)
    probs = softmax([l / temperature for l in logits])
    token_id = random.choices(range(vocab_size), weights=[p.data for p in probs])[0]
    if token_id == BOS:
        break`,
  },
};

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCodeWithLineAnchors(target, source) {
  const lines = source.split("\n");
  target.innerHTML = lines
    .map((line, index) => {
      const lineNo = index + 1;
      return `<span class="code-line" id="L${lineNo}"><a class="line-number" href="#L${lineNo}">${lineNo.toString().padStart(3, " ")}</a>${escapeHtml(line)}</span>`;
    })
    .join("\n");
}

function jumpToCoreLine(lineNumber) {
  const line = document.getElementById(`L${lineNumber}`);
  if (!line) return;
  const section = document.getElementById("core-code");
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.setTimeout(() => {
    line.scrollIntoView({ behavior: "smooth", block: "center" });
    history.replaceState(null, "", `#L${lineNumber}`);
  }, 180);
}

function setupConceptJumps() {
  const links = Array.from(document.querySelectorAll(".card-jump[data-line]"));
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const line = Number(link.dataset.line || "0");
      if (line > 0) jumpToCoreLine(line);
    });
  });
}

function setupCodeMap() {
  const title = document.getElementById("mapTitle");
  const code = document.getElementById("mapCode");
  const buttons = Array.from(document.querySelectorAll(".map-step"));
  if (!title || !code || buttons.length === 0) return;

  function activate(stepKey) {
    const item = CODE_MAP[stepKey];
    if (!item) return;
    title.textContent = item.title;
    code.textContent = item.code;
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.step === stepKey);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activate(button.dataset.step || "dataset");
    });
    button.addEventListener("keydown", (event) => {
      const currentIndex = buttons.indexOf(button);
      if (currentIndex < 0) return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        buttons[(currentIndex + 1) % buttons.length].focus();
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        buttons[(currentIndex - 1 + buttons.length) % buttons.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        buttons[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        buttons[buttons.length - 1].focus();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(button.dataset.step || "dataset");
      }
    });
  });

  activate("dataset");
}

function animatePipeline() {
  const canvas = document.getElementById("pipelineAnim");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const boxes = [
    { label: "Token", x: 20, w: 88, color: "#d8eef2" },
    { label: "Embed", x: 120, w: 98, color: "#ffe7c9" },
    { label: "Attn", x: 232, w: 96, color: "#dbf3ea" },
    { label: "MLP", x: 342, w: 88, color: "#f7ece0" },
    { label: "Logits", x: 444, w: 92, color: "#e7f0ff" },
  ];

  function drawBox(box) {
    ctx.fillStyle = box.color;
    ctx.strokeStyle = "#7b8794";
    ctx.lineWidth = 1;
    ctx.fillRect(box.x, 90, box.w, 56);
    ctx.strokeRect(box.x, 90, box.w, 56);
    ctx.fillStyle = "#1b1e23";
    ctx.font = "14px Space Grotesk";
    ctx.fillText(box.label, box.x + 18, 123);
  }

  function drawFrame(time) {
    const t = (time / 1000) % 5;
    const progress = t / 5;
    ctx.clearRect(0, 0, width, height);
    boxes.forEach(drawBox);

    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    for (let i = 0; i < boxes.length - 1; i += 1) {
      const x1 = boxes[i].x + boxes[i].w;
      const x2 = boxes[i + 1].x;
      ctx.beginPath();
      ctx.moveTo(x1 + 4, 118);
      ctx.lineTo(x2 - 4, 118);
      ctx.stroke();
    }

    const start = boxes[0].x + 8;
    const end = boxes[boxes.length - 1].x + boxes[boxes.length - 1].w - 8;
    const dotX = start + (end - start) * progress;
    ctx.fillStyle = "#e76f51";
    ctx.beginPath();
    ctx.arc(dotX, 118, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#475569";
    ctx.font = "12px IBM Plex Mono";
    ctx.fillText("next token distribution", 356, 172);

    window.requestAnimationFrame(drawFrame);
  }

  window.requestAnimationFrame(drawFrame);
}

async function loadCoreCode() {
  const el = document.getElementById("coreCode");
  if (!el) return;
  try {
    const response = await fetch("assets/microgpt.py", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load source file");
    const text = await response.text();
    renderCodeWithLineAnchors(el, text);
  } catch (_error) {
    el.textContent =
      "Unable to load local source. Open docs/assets/microgpt.py directly.";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadCoreCode().then(() => {
    setupConceptJumps();
  });
  setupCodeMap();
  drawLossChart();
  drawAttentionHeatmap();
  animatePipeline();
});
