(function () {
  const data = {
    "Global": {
      construction:    { total: 542,  operating: 329 },
      preConstruction: { total: 1993, operating: 698 },
      announced:       { total: 1414, operating: 325 },
      triplingGap: 6600
    },

    "Europe": {
      construction:    { total: 210,  operating: 130 },
      preConstruction: { total: 720,  operating: 260 },
      announced:       { total: 510,  operating: 170 },
      triplingGap: 2400
    },

    "Near target test": {
      construction:    { total: 380,  operating: 240 },
      preConstruction: { total: 980,  operating: 410 },
      announced:       { total: 620,  operating: 180 },
      triplingGap: 850
    },

    "Gap-heavy test": {
      construction:    { total: 140,  operating: 90 },
      preConstruction: { total: 280,  operating: 110 },
      announced:       { total: 180,  operating: 40 },
      triplingGap: 3200
    },

    "Pipeline-heavy test": {
      construction:    { total: 460,  operating: 260 },
      preConstruction: { total: 2400, operating: 760 },
      announced:       { total: 1900, operating: 430 },
      triplingGap: 1800
    },

    "Small system test": {
      construction:    { total: 55,   operating: 35 },
      preConstruction: { total: 120,  operating: 50 },
      announced:       { total: 90,   operating: 18 },
      triplingGap: 260
    },

    "Very large test": {
      construction:    { total: 980,  operating: 620 },
      preConstruction: { total: 3100, operating: 980 },
      announced:       { total: 2300, operating: 540 },
      triplingGap: 8200
    }
  };

  const mount = document.getElementById("renewable-d3-chart");
  const select = document.getElementById("d3-country-select");

  if (!mount || !select || typeof d3 === "undefined") return;

  const DARK = "#002430";
  const GREEN_LIGHT = "#65BD8B";
  const LIGHT_TEXT = "#e0f2e9";
  const FONT = '"Plus Jakarta Sans", sans-serif';

  const W = 760;
  const COL_X = [28, 175, 330, 500];

  const maxTriplingTotal = d3.max(Object.values(data), d =>
    d.construction.total + d.preConstruction.total + d.announced.total + d.triplingGap
  );

  const SCALE_K = 240 / Math.sqrt(maxTriplingTotal);

  function gw2side(gw) {
    return Math.sqrt(gw) * SCALE_K;
  }

  function populateSelect() {
    select.innerHTML = "";
    Object.keys(data).forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
    select.value = "Global";
  }

  function draw(countryName) {
    mount.innerHTML = "";
    const d = data[countryName];

    const categories = [
      { label: "Construction",     x: COL_X[0], d: d.construction },
      { label: "Pre-construction", x: COL_X[1], d: d.preConstruction },
      { label: "Announced",        x: COL_X[2], d: d.announced }
    ];

    const combinedTotal = categories.reduce((s, c) => s + c.d.total, 0);
    const combinedOperating = categories.reduce((s, c) => s + c.d.operating, 0);
    const triplingTotal = combinedTotal + d.triplingGap;

    const tripSide = gw2side(triplingTotal);
    const combinedOuterSide = gw2side(combinedTotal);

    const TOP_BAND = 38;
    const GAP_ABOVE_BOX = 16;
    const BASELINE_Y = TOP_BAND + GAP_ABOVE_BOX + tripSide;
    const BOTTOM_BAND = 84;
    const H = BASELINE_Y + BOTTOM_BAND;

    const svg = d3.select(mount)
      .append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMin meet")
      .style("font-family", FONT);

    function addText({
      x, y, text, size = 11, fill = DARK, weight = 400,
      anchor = "start", style = "normal"
    }) {
      return svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", size)
        .attr("fill", fill)
        .attr("font-weight", weight)
        .attr("text-anchor", anchor)
        .attr("font-style", style)
        .style("font-family", FONT)
        .text(text);
    }

    function drawValueLabel(x, y, side, label, fill, weight, mode = "outer") {
      if (side >= 34) {
        addText({
          x: x + 5,
          y: y + 14,
          text: label,
          size: 10.5,
          fill,
          weight
        });
      } else if (mode === "outer") {
        addText({
          x: x + side / 2,
          y: y - 4,
          text: label,
          size: 10,
          fill: DARK,
          weight,
          anchor: "middle"
        });
      }
    }

    function drawSquarePair(x, outerGW, innerGW) {
      const outerSide = gw2side(outerGW);
      const innerSide = gw2side(innerGW);

      const yOuter = BASELINE_Y - outerSide;
      const yInner = BASELINE_Y - innerSide;

      svg.append("rect")
        .attr("x", x)
        .attr("y", yOuter)
        .attr("width", outerSide)
        .attr("height", outerSide)
        .attr("fill", GREEN_LIGHT);

      svg.append("rect")
        .attr("x", x)
        .attr("y", yInner)
        .attr("width", innerSide)
        .attr("height", innerSide)
        .attr("fill", DARK);

      drawValueLabel(x, yOuter, outerSide, `${outerGW.toLocaleString()} GW`, DARK, 600, "outer");
      drawValueLabel(x, yInner, innerSide, `${innerGW.toLocaleString()} GW`, LIGHT_TEXT, 600, "inner");

      return { outerSide, innerSide, yOuter, yInner };
    }

    categories.forEach(cat => {
      const { outerSide } = drawSquarePair(cat.x, cat.d.total, cat.d.operating);

      addText({
        x: cat.x + outerSide / 2,
        y: BASELINE_Y + 22,
        text: cat.label,
        size: 11.5,
        fill: DARK,
        anchor: "middle"
      });
    });

    const cx = COL_X[3];
    const yTrip = BASELINE_Y - tripSide;

    svg.append("rect")
      .attr("x", cx)
      .attr("y", yTrip)
      .attr("width", tripSide)
      .attr("height", tripSide)
      .attr("fill", "none")
      .attr("stroke", DARK)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "6,4")
      .attr("opacity", 0.6);

    drawSquarePair(cx, combinedTotal, combinedOperating);

    const annotCX = cx + tripSide / 2;
    const annotY1 = 19;
    const annotY2 = 34;
    const lineStartY = 40;

    addText({
      x: annotCX,
      y: annotY1,
      text: `+${d.triplingGap.toLocaleString()} GW for`,
      size: 11,
      fill: DARK,
      weight: 600,
      anchor: "middle"
    });

    addText({
      x: annotCX,
      y: annotY2,
      text: "tripling renewables",
      size: 11,
      fill: DARK,
      anchor: "middle"
    });

    svg.append("line")
      .attr("x1", annotCX)
      .attr("y1", lineStartY)
      .attr("x2", annotCX)
      .attr("y2", yTrip)
      .attr("stroke", DARK)
      .attr("stroke-width", 1)
      .attr("opacity", 0.55);

    ["Construction +", "Pre-construction +", "Announced"].forEach((line, i) => {
      addText({
        x: cx + combinedOuterSide / 2,
        y: BASELINE_Y + 22 + i * 14,
        text: line,
        size: 11.5,
        fill: DARK,
        anchor: "middle"
      });
    });

    const refX = 16;
    const refY = 16;
    const outerRef = 78;
    const innerRef = 56;

    svg.append("rect")
      .attr("x", refX)
      .attr("y", refY)
      .attr("width", outerRef)
      .attr("height", outerRef)
      .attr("fill", "none")
      .attr("stroke", DARK)
      .attr("stroke-width", 1.5);

    svg.append("rect")
      .attr("x", refX)
      .attr("y", refY + outerRef - innerRef)
      .attr("width", innerRef)
      .attr("height", innerRef)
      .attr("fill", "none")
      .attr("stroke", DARK)
      .attr("stroke-width", 1.5);

    const legLX = refX + outerRef + 10;

    const outerLeaderY = refY + 20;
    svg.append("line")
      .attr("x1", refX + outerRef)
      .attr("y1", outerLeaderY)
      .attr("x2", legLX)
      .attr("y2", outerLeaderY)
      .attr("stroke", DARK)
      .attr("stroke-width", 0.8)
      .attr("opacity", 0.55);

    addText({
      x: legLX + 4,
      y: outerLeaderY - 4,
      text: "All projects with unknown",
      size: 10.5,
      fill: DARK
    });

    addText({
      x: legLX + 4,
      y: outerLeaderY + 11,
      text: "commissioning year online by 2030",
      size: 10.5,
      fill: DARK
    });

    const innerLeaderY = refY + outerRef - innerRef + 20;
    svg.append("line")
      .attr("x1", refX + innerRef)
      .attr("y1", innerLeaderY)
      .attr("x2", legLX)
      .attr("y2", innerLeaderY)
      .attr("stroke", DARK)
      .attr("stroke-width", 0.8)
      .attr("opacity", 0.55);

    addText({
      x: legLX + 4,
      y: innerLeaderY + 4,
      text: "Pre-2030 commissioning",
      size: 10.5,
      fill: DARK
    });
  }

  populateSelect();
  draw(select.value);

  select.addEventListener("change", function () {
    draw(this.value);
  });
})();
