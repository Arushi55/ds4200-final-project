const data = d3.csv("graph2_data.csv");

data.then(function(data) {
    // Convert count to number
    data.forEach(function(d) {
        d.count = +d.count;
    });

    // --- Build one object per country with Movie + TV Show counts ---
    const countryMap = {};
    data.forEach(function(d) {
        if (!countryMap[d.country]) {
            countryMap[d.country] = { country: d.country, Movie: 0, "TV Show": 0 };
        }
        countryMap[d.country][d.type] = d.count;
    });

    const pivoted = Object.values(countryMap);
    pivoted.forEach(function(d) { d.total = d.Movie + d["TV Show"]; });

    // Preserve CSV order (already sorted by total desc from cleaning script)
    const countryOrder = [...new Set(data.map(d => d.country))];
    pivoted.sort((a, b) => countryOrder.indexOf(a.country) - countryOrder.indexOf(b.country));

    // --- Dimensions ---
    const width = 820, height = 520;
    const margin = { top: 70, bottom: 30, left: 145, right: 10 };

    // --- SVG container ---
    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#f5f0eb")
        .style("font-family", "Arial, sans-serif");

    // --- Title ---
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 22)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#222")
        .text("Top 10 Countries by Content Type");

    // --- Scales ---
    const types = ["Movie", "TV Show"];
    const countries = pivoted.map(d => d.country);

    const y = d3.scaleBand()
        .domain(countries)
        .range([margin.top, height - margin.bottom])
        .padding(0.25);

    const x = d3.scaleLinear()
        .domain([0, d3.max(pivoted, d => d.total) * 1.08])
        .range([margin.left, width - margin.right])
        .nice();

    const color = d3.scaleOrdinal()
        .domain(types)
        .range(["rgb(161,222,240)", "rgb(21,81,38)"]); // created with colorgorical

    // --- Stack the data ---
    const stacked = d3.stack()
        .keys(types)
        .value((d, key) => d[key])(pivoted);

    // --- Vertical grid lines (from x axis) ---
    svg.append("g")
        .attr("transform", `translate(0,${margin.top})`)
        .call(
            d3.axisBottom(x)
                .ticks(7)
                .tickSize(height - margin.top - margin.bottom)
                .tickFormat("")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .style("stroke", "#ddd")
            .style("stroke-width", "1px"));

    // --- Horizontal grid lines (from y axis) ---
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(
            d3.axisLeft(y)
                .tickSize(-(width - margin.left - margin.right))
                .tickFormat("")
        )
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
            .style("stroke", "#ddd")
            .style("stroke-width", "1px"));

    // --- Y axis (country labels) ---
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#333");

    // --- X axis ---
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(",")))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", "#666");

    // --- Tooltip ---
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "rgba(30,30,30,0.92)")
        .style("color", "#fff")
        .style("padding", "10px 14px")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("visibility", "hidden")

    // --- Stacked bars ---
    svg.selectAll(".layer")
        .data(stacked)
        .enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("y", d => y(d.data.country))
        .attr("x", d => x(d[0]))
        .attr("width", d => Math.max(0, x(d[1]) - x(d[0])))
        .attr("height", y.bandwidth())
        .attr("rx", 2)

        // Show tooltip on hover
        .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(
                    `<strong>${d.data.country}</strong><br>` +
                    `<span style="display:inline-block;width:10px;height:10px;` +
                    `background:#4e8de8;border-radius:2px;margin-right:6px;"></span>` +
                    `Movies: ${d.data.Movie.toLocaleString()}<br>` +
                    `<span style="display:inline-block;width:10px;height:10px;` +
                    `background:#e06040;border-radius:2px;margin-right:6px;"></span>` +
                    `TV Shows: ${d.data["TV Show"].toLocaleString()}<br>` +
                    `<strong>Total: ${d.data.total.toLocaleString()}</strong>`
                );
        })

        // Move tooltip with mouse
        .on("mousemove", function(event) {
            tooltip
                .style("top",  (event.pageY - 10) + "px")
                .style("left", (event.pageX + 14) + "px");
        })

        // Hide tooltip on mouse out
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // --- Legend ---
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left}, 40)`);

    types.forEach(function(type, i) {
        const g = legend.append("g").attr("transform", `translate(${i * 120}, 0)`);

        g.append("rect")
            .attr("width", 14).attr("height", 14)
            .attr("rx", 2)
            .attr("fill", color(type));

        g.append("text")
            .attr("x", 20).attr("y", 11)
            .text(type === "Movie" ? "Movies" : "TV Shows")
            .style("font-size", "12px")
            .style("fill", "#333");
    });
});
