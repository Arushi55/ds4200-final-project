(async function () {
  const g2 = await d3.csv("graph2_data.csv", (d) => ({ ...d, count: +d.count }));

  const g5 = await d3.csv("graph2_genre_data.csv", (d) => ({
    ...d,
    count: +d.count,
    pct: +d.pct,
  }));

  const genreByCountry = d3.group(g5, (d) => d.country);

  // Pivot g2 into {country, Movie, TV Show, total}
  const cm = {};
  g2.forEach((d) => {
    if (!cm[d.country])
      cm[d.country] = { country: d.country, Movie: 0, "TV Show": 0 };
    cm[d.country][d.type] = d.count;
  });
  const pivoted = Object.values(cm);
  pivoted.forEach((d) => (d.total = d.Movie + d["TV Show"]));
  const cOrder = [...new Set(g2.map((d) => d.country))];
  pivoted.sort(
    (a, b) => cOrder.indexOf(a.country) - cOrder.indexOf(b.country),
  );

  // ── DIMENSIONS ──────────────────────────────────────────────
  const TW = 960, TH = 520, GAP = 16;
  const LW = 490, RW = TW - LW - GAP;
  const LM = { top: 70, bottom: 30, left: 148, right: 16 };
  const RM = { top: 70, bottom: 30, left: 162, right: 12 };

  // ── SVG ─────────────────────────────────────────────────────
  const svg = d3
    .select("#barplot")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${TW} ${TH}`)
    .style("background", "#f5f0eb")
    .style("font-family", "Arial, sans-serif");

  // ── LEFT PANEL ──────────────────────────────────────────────
  const LP = svg.append("g");

  const types = ["Movie", "TV Show"];
  const yL = d3
    .scaleBand()
    .domain(pivoted.map((d) => d.country))
    .range([LM.top, TH - LM.bottom])
    .padding(0.25);
  const xL = d3
    .scaleLinear()
    .domain([0, d3.max(pivoted, (d) => d.total) * 1.08])
    .range([LM.left, LW - LM.right])
    .nice();
  const colorType = d3
    .scaleOrdinal()
    .domain(types)
    .range(["#4e8de8", "#e06040"]);
  const stacked = d3.stack().keys(types).value((d, key) => d[key])(pivoted);

  // Vertical grid
  LP.append("g")
    .attr("transform", `translate(0,${LM.top})`)
    .call(
      d3
        .axisBottom(xL)
        .ticks(5)
        .tickSize(TH - LM.top - LM.bottom)
        .tickFormat(""),
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .style("stroke", "#ddd")
        .style("stroke-width", "1px"),
    );

  // Horizontal grid
  LP.append("g")
    .attr("transform", `translate(${LM.left},0)`)
    .call(
      d3
        .axisLeft(yL)
        .tickSize(-(LW - LM.left - LM.right))
        .tickFormat(""),
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .style("stroke", "#ddd")
        .style("stroke-width", "1px"),
    );

  // Y-axis labels (country names)
  LP.append("g")
    .attr("class", "yL-axis")
    .attr("transform", `translate(${LM.left},0)`)
    .call(d3.axisLeft(yL).tickSize(0).tickPadding(10))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .style("font-size", "12px")
    .style("fill", "#555")
    .style("cursor", "pointer");

  // X-axis
  LP.append("g")
    .attr("transform", `translate(0,${TH - LM.bottom})`)
    .call(d3.axisBottom(xL).ticks(5).tickFormat(d3.format(",")))
    .call((g) => g.select(".domain").remove())
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#666");

  // Stacked bars
  LP.selectAll(".layer")
    .data(stacked)
    .enter()
    .append("g")
    .attr("class", "layer")
    .attr("fill", (d) => colorType(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("class", "bar-seg")
    .attr("y", (d) => yL(d.data.country))
    .attr("x", (d) => xL(d[0]))
    .attr("width", (d) => Math.max(0, xL(d[1]) - xL(d[0])))
    .attr("height", yL.bandwidth())
    .attr("rx", 2)
    .style("cursor", "pointer");

  // Left panel title
  LP.append("text")
    .attr("x", LW / 2)
    .attr("y", 22)
    .style("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .style("fill", "#222")
    .text("Top 10 Countries by Content Type");

  // Legend
  const leg = LP.append("g").attr("transform", `translate(${LM.left},40)`);
  types.forEach((t, i) => {
    const g = leg.append("g").attr("transform", `translate(${i * 115},0)`);
    g.append("rect")
      .attr("width", 13)
      .attr("height", 13)
      .attr("rx", 2)
      .attr("fill", colorType(t));
    g.append("text")
      .attr("x", 18)
      .attr("y", 10.5)
      .text(t === "Movie" ? "Movies" : "TV Shows")
      .style("font-size", "12px")
      .style("fill", "#333");
  });

  // Divider between panels
  svg
    .append("line")
    .attr("x1", LW + GAP / 2)
    .attr("y1", 20)
    .attr("x2", LW + GAP / 2)
    .attr("y2", TH - 10)
    .style("stroke", "#ccc")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "4,3");

  // ── RIGHT PANEL ─────────────────────────────────────────────
  const RP = svg
    .append("g")
    .attr("transform", `translate(${LW + GAP},0)`);

  const genreColors = d3
    .scaleOrdinal()
    .domain([
      "International Movies",
      "Dramas",
      "Comedies",
      "Action & Adventure",
      "Independent Movies",
      "Romantic Movies",
      "Children & Family Movies",
      "Thrillers",
    ])
    .range([
      "#78b98f",
      "#8a1341",
      "#6fef70",
      "#eb67f9",
      "#1c5f1e",
      "#f53a4c",
      "#a3c541",
      "#3a427d",
    ]);

  const rpTitle = RP.append("text")
    .attr("x", RW / 2)
    .attr("y", 22)
    .style("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .style("fill", "#222");

  // ── TOOLTIP ─────────────────────────────────────────────────
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(30,30,30,0.92)")
    .style("color", "#fff")
    .style("padding", "10px 14px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("visibility", "hidden")
    .style("line-height", "2")
    .style("pointer-events", "none");

  // ── RIGHT PANEL UPDATE ───────────────────────────────────────
  function updateRight(country) {
    rpTitle.text("Genre Breakdown \u2014 " + country);

    const genres = (genreByCountry.get(country) || [])
      .slice()
      .sort((a, b) => b.count - a.count);
    const maxPct = d3.max(genres, (d) => d.pct) || 50;

    const yR = d3
      .scaleBand()
      .domain(genres.map((d) => d.genre))
      .range([RM.top, TH - RM.bottom])
      .padding(0.28);
    const xR = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxPct / 10) * 10])
      .range([RM.left, RW - RM.right]);

    RP.selectAll(".rp-c").remove();
    const C = RP.append("g").attr("class", "rp-c");

    // Vertical grid
    C.append("g")
      .attr("transform", `translate(0,${RM.top})`)
      .call(
        d3
          .axisBottom(xR)
          .ticks(4)
          .tickSize(TH - RM.top - RM.bottom)
          .tickFormat(""),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .style("stroke", "#ddd")
          .style("stroke-width", "1px"),
      );

    // Horizontal grid
    C.append("g")
      .attr("transform", `translate(${RM.left},0)`)
      .call(
        d3
          .axisLeft(yR)
          .tickSize(-(RW - RM.left - RM.right))
          .tickFormat(""),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .style("stroke", "#ddd")
          .style("stroke-width", "1px"),
      );

    // Y axis (genre labels)
    C.append("g")
      .attr("transform", `translate(${RM.left},0)`)
      .call(d3.axisLeft(yR).tickSize(0).tickPadding(8))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "10.5px")
      .style("fill", "#333");

    // X axis
    C.append("g")
      .attr("transform", `translate(0,${TH - RM.bottom})`)
      .call(d3.axisBottom(xR).ticks(4).tickFormat((d) => d + "%"))
      .call((g) => g.select(".domain").remove())
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#666");

    // Bars with enter transition
    C.selectAll(".g-bar")
      .data(genres)
      .enter()
      .append("rect")
      .attr("class", "g-bar")
      .attr("y", (d) => yR(d.genre))
      .attr("x", RM.left)
      .attr("height", yR.bandwidth())
      .attr("rx", 2)
      .attr("fill", (d) => genreColors(d.genre))
      .attr("width", 0)
      .transition()
      .duration(350)
      .attr("width", (d) => Math.max(0, xR(d.pct) - RM.left));

    // Percentage labels
    C.selectAll(".g-pct")
      .data(genres)
      .enter()
      .append("text")
      .attr("class", "g-pct")
      .attr("y", (d) => yR(d.genre) + yR.bandwidth() / 2 + 4)
      .attr("x", (d) => xR(d.pct) + 4)
      .style("font-size", "10px")
      .style("fill", "#555")
      .style("opacity", 0)
      .text((d) => d.pct.toFixed(1) + "%")
      .transition()
      .duration(350)
      .style("opacity", 1);
  }

  // ── SELECTION LOGIC ─────────────────────────────────────────
  function applySelection(country) {
    LP.selectAll(".bar-seg").attr("opacity", (d) =>
      d.data.country === country ? 1 : 0.2,
    );
    LP.select(".yL-axis")
      .selectAll("text")
      .style("font-weight", (d) => (d === country ? "bold" : "normal"))
      .style("fill", (d) => (d === country ? "#111" : "#555"));
    updateRight(country);
  }

  // ── EVENTS ──────────────────────────────────────────────────
  LP.selectAll(".bar-seg")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible").html(
        `<strong>${d.data.country}</strong><br>` +
          `<span style="display:inline-block;width:10px;height:10px;background:#4e8de8;border-radius:2px;margin-right:6px;"></span>Movies: ${d.data.Movie.toLocaleString()}<br>` +
          `<span style="display:inline-block;width:10px;height:10px;background:#e06040;border-radius:2px;margin-right:6px;"></span>TV Shows: ${d.data["TV Show"].toLocaleString()}<br>` +
          `<strong>Total: ${d.data.total.toLocaleString()}</strong>`,
      );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 14 + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"))
    .on("click", (event, d) => applySelection(d.data.country));

  LP.select(".yL-axis")
    .selectAll("text")
    .on("click", (event, d) => applySelection(d));

  // ── DEFAULT: United States ───────────────────────────────────
  applySelection("United States");
})();
