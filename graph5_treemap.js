// Graph 5: Netflix Catalog Treemap — two-level drill-down
// Level 1: Movies vs TV Shows (click to explore)
// Level 2: Genre breakdown for the selected type (← Back to return)

const movieColors = [
  "#1a5f7a","#2d7d9a","#3a9cbf","#5bb8d4","#7fcce0",
  "#a3dded","#c4ecf5","#1d6b55","#2d9070","#4ab38e"
];
const tvColors = [
  "#8b1a1a","#b52424","#d43d3d","#e86a6a","#f29090",
  "#f5aaaa","#e8452a","#c43520","#f07050","#f5a090"
];

const W = 900, H = 520;
const margin = { top: 44, right: 10, bottom: 10, left: 10 };
const innerW = W - margin.left - margin.right;
const innerH = H - margin.top - margin.bottom;

const svg = d3.select("#treemap")
  .append("svg")
  .attr("viewBox", `0 0 ${W} ${H}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("width", "100%")
  .style("display", "block")
  .style("font-family", "Arial, sans-serif")
  .style("background", "#f5f0eb");

const titleText = svg.append("text")
  .attr("x", W / 2).attr("y", 22)
  .style("text-anchor", "middle").style("font-size", "14px")
  .style("font-weight", "bold").style("fill", "#222");

const subtitleText = svg.append("text")
  .attr("x", W / 2).attr("y", 38)
  .style("text-anchor", "middle").style("font-size", "10px")
  .style("fill", "#888");

// Back button (hidden at level 1)
const backBtn = svg.append("g")
  .attr("transform", `translate(${margin.left + 4}, 5)`)
  .style("cursor", "pointer")
  .style("visibility", "hidden");

backBtn.append("rect")
  .attr("width", 68).attr("height", 22).attr("rx", 11).attr("fill", "#444");

backBtn.append("text")
  .attr("x", 34).attr("y", 15)
  .style("text-anchor", "middle").style("font-size", "11px")
  .style("fill", "#fff").style("pointer-events", "none")
  .text("← Back");

const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const g5tooltip = d3.select("body").append("div")
  .style("position", "absolute")
  .style("background", "rgba(20,20,20,0.92)")
  .style("color", "#fff")
  .style("padding", "10px 14px")
  .style("border-radius", "6px")
  .style("font-size", "12px")
  .style("pointer-events", "none")
  .style("visibility", "hidden")
  .style("line-height", "1.8");

// -- Label helper -------------------------------------------------------------
function labelNodes(nodes, totalValue) {
  nodes.each(function(d) {
    const bw = d.x1 - d.x0;
    const bh = d.y1 - d.y0;
    if (bw < 48 || bh < 20) return;
    const cell = d3.select(this);
    const lineH = 13;
    const maxLines = Math.floor((bh - 18) / lineH);
    const words = d.data.name.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      if ((line + " " + word).trim().length > Math.floor(bw / 7)) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = (line + " " + word).trim();
      }
    }
    if (line) lines.push(line);
    const displayLines = lines.slice(0, maxLines);
    displayLines.forEach((l, i) => {
      cell.append("text")
        .attr("x", 4).attr("y", 14 + i * lineH)
        .style("font-size", "10px").style("fill", "#fff")
        .style("pointer-events", "none")
        .text(l);
    });
    if (bh > 38) {
      const pct = ((d.value / totalValue) * 100).toFixed(1);
      cell.append("text")
        .attr("x", 4).attr("y", 14 + displayLines.length * lineH + 2)
        .style("font-size", "9px").style("fill", "rgba(255,255,255,0.7)")
        .style("pointer-events", "none")
        .text(`${d.value.toLocaleString()} (${pct}%)`);
    }
  });
}

// -- Level 1: Movies vs TV Shows ----------------------------------------------
function drawLevel1(data) {
  g.selectAll("*").remove();
  backBtn.style("visibility", "hidden");
  titleText.text("Netflix Catalog: Movies vs. TV Shows");
  subtitleText.text("Size = number of titles  ·  Click a tile to explore genres");

  const movieTotal = d3.sum(data.filter(d => d.type === "Movie"), d => d.value);
  const tvTotal    = d3.sum(data.filter(d => d.type === "TV Show"), d => d.value);
  const total = movieTotal + tvTotal;

  const root = d3.hierarchy({
    name: "Netflix",
    children: [
      { name: "Movies",   value: movieTotal },
      { name: "TV Shows", value: tvTotal    }
    ]
  }).sum(d => d.value).sort((a, b) => b.value - a.value);

  d3.treemap().size([innerW, innerH]).paddingOuter(6).paddingInner(4).round(true)(root);

  const palette = ["#1a5f7a", "#8b1a1a"];

  const nodes = g.selectAll("g")
    .data(root.descendants().filter(d => d.depth === 1))
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.append("rect")
    .attr("width",  d => Math.max(0, d.x1 - d.x0))
    .attr("height", d => Math.max(0, d.y1 - d.y0))
    .attr("rx", 4)
    .attr("fill", (d, i) => palette[i])
    .attr("opacity", 0.88)
    .attr("stroke", "#f5f0eb")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 1);
      const pct = ((d.value / total) * 100).toFixed(1);
      g5tooltip.style("visibility", "visible").html(
        `<strong>${d.data.name}</strong><br>` +
        `Titles: <strong>${d.value.toLocaleString()}</strong><br>` +
        `${pct}% of catalog`
      );
    })
    .on("mousemove", function(event) {
      g5tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 14) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 0.88);
      g5tooltip.style("visibility", "hidden");
    })
    .on("click", function(event, d) {
      g5tooltip.style("visibility", "hidden");
      drawLevel2(d.data.name, data);
    });

  // Centered labels for both tiles; clip to tile bounds; rotate for narrow tiles
  nodes.each(function(d, i) {
    const bw = d.x1 - d.x0;
    const bh = d.y1 - d.y0;
    const narrow = bw < 60;
    const cell = d3.select(this);

    const clipId = `clip-l1-${i}`;
    cell.append("clipPath").attr("id", clipId)
      .append("rect").attr("width", bw).attr("height", bh).attr("rx", 4);

    const inner = cell.append("g")
      .attr("clip-path", `url(#${clipId})`)
      .append("g")
      .attr("transform", narrow
        ? `translate(${bw / 2},${bh / 2}) rotate(-90)`
        : `translate(${bw / 2},${bh / 2})`);

    inner.append("text")
      .attr("y", narrow ? -2 : -8)
      .style("text-anchor", "middle")
      .style("font-size", narrow ? "12px" : (bw > 200 ? "18px" : "14px"))
      .style("font-weight", "bold").style("fill", "#fff")
      .style("pointer-events", "none")
      .text(d.data.name);
    inner.append("text")
      .attr("y", narrow ? 10 : 12)
      .style("text-anchor", "middle")
      .style("font-size", narrow ? "10px" : (bw > 200 ? "12px" : "10px"))
      .style("fill", "rgba(255,255,255,0.8)")
      .style("pointer-events", "none")
      .text(`${d.value.toLocaleString()} titles`);
  });
}

// -- Level 2: Genre breakdown -------------------------------------------------
function drawLevel2(typeName, data) {
  g.selectAll("*").remove();
  backBtn.style("visibility", "visible");
  titleText.text(`Netflix ${typeName}: Genre Breakdown`);
  subtitleText.text("Size = number of titles  ·  Hover for details  ·  Click ← to go back");

  const typeKey = typeName === "Movies" ? "Movie" : "TV Show";
  const genres = data.filter(d => d.type === typeKey).map(d => ({ name: d.genre, value: d.value }));

  const root = d3.hierarchy({ name: typeName, children: genres })
    .sum(d => d.value).sort((a, b) => b.value - a.value);

  d3.treemap().size([innerW, innerH]).paddingOuter(6).paddingInner(2).paddingTop(2).round(true)(root);

  const palette = typeName === "Movies" ? movieColors : tvColors;

  const nodes = g.selectAll("g")
    .data(root.descendants().filter(d => d.depth === 1))
    .enter().append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.append("rect")
    .attr("width",  d => Math.max(0, d.x1 - d.x0))
    .attr("height", d => Math.max(0, d.y1 - d.y0))
    .attr("rx", 3)
    .attr("fill", d => palette[d.parent.children.indexOf(d) % palette.length])
    .attr("opacity", 0.88)
    .attr("stroke", "#f5f0eb")
    .attr("stroke-width", 0.5)
    .style("cursor", "default")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 1);
      const pct = ((d.value / root.value) * 100).toFixed(1);
      g5tooltip.style("visibility", "visible").html(
        `<strong>${d.data.name}</strong><br>` +
        `Type: ${typeName}<br>` +
        `Titles: <strong>${d.value.toLocaleString()}</strong><br>` +
        `${pct}% of ${typeName.toLowerCase()}`
      );
    })
    .on("mousemove", function(event) {
      g5tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 14) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 0.88);
      g5tooltip.style("visibility", "hidden");
    });

  labelNodes(nodes, root.value);
}

// -- Load data ----------------------------------------------------------------
d3.csv("graph5_treemap_data.csv").then(function(data) {
  data.forEach(d => { d.value = +d.value; });
  drawLevel1(data);
  backBtn.on("click", () => drawLevel1(data));
}).catch(() => {
  d3.select("#treemap").append("p")
    .style("color", "red").style("padding", "20px")
    .text("Could not load graph5_treemap_data.csv — make sure it is in the same folder.");
});
