// Set up SVG dimensions
const width = 800;
const height = 600;

const svg = d3.select("#canvas")
    .attr("width", width)
    .attr("height", height);

// Update the title
svg.select("#title")
    .text("French Departments")
    .attr("x", width / 2)
    .attr("text-anchor", "middle");

const projection = d3.geoConicConformal().center([2.454071, 46.279229]).scale(2800).translate([width / 2, height / 2]);
const pathGenerator = d3.geoPath().projection(projection);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

function getAnnualWasteTonnage(wasteData, departmentCode, wasteType = "DEEE") {
    const records = wasteData.filter(d =>
        d.C_DEPT === departmentCode &&
        d.L_TYP_REG_DECHET === wasteType
    );
    return records.map(record => ({
        year: parseInt(record.ANNEE),
        tonnage: parseFloat(record.TONNAGE_T.replace(",", "."))
    })).sort((a, b) => a.year - b.year);
}

function getTonnageForYear(annualData, year) {
    const data = annualData.find(d => d.year === year);
    return data ? data.tonnage : null;
}

let geoData, colorScale, mapGroup, paths;

function drawMap(year) {
    
    // Clear existing map if any
    if (mapGroup) {
        mapGroup.selectAll("*").remove();
    } else {
        mapGroup = svg.append("g");
    }

    // Draw each department
    paths = mapGroup.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", pathGenerator)
        .attr("fill", d => {
            const tonnage = getTonnageForYear(d.properties.annualWaste, year);
            return tonnage !== null ? colorScale(tonnage) : "#ccc";
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            const originalColor = d3.select(this).attr("fill");
            d3.select(this).attr("data-original-color", originalColor);

            // Highlight on hover
            d3.select(this)
                .attr("fill", "#ff6b6b")
                .attr("stroke-width", 2);

            // Get waste tonnage for current year
            const tonnage = getTonnageForYear(d.properties.annualWaste, year);

            // Show tooltip
            const tonnageText = tonnage !== null ? `${tonnage.toFixed(2)} tonnes` : "No data";

            tooltip
                .html(`
                    <strong>${d.properties.nom}</strong><br/>
                    DEEE Waste (${year}): ${tonnageText}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .classed("visible", true);
        })
        .on("mousemove", function(event) {
            // Update tooltip position as mouse moves
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function(event, d) {
            // Restore original color
            const originalColor = d3.select(this).attr("data-original-color");
            d3.select(this)
                .attr("fill", originalColor)
                .attr("stroke-width", 0.5);

            // Hide tooltip
            tooltip.classed("visible", false);
        });
}

// Load both CSV and GeoJSON data
Promise.all([
    d3.json("departements-version-simplifiee.geojson"),
    d3.csv("SINOE14_TonnageDecheterieParTypeDechet.csv")
])
.then(([loadedGeoData, wasteData]) => {
    geoData = loadedGeoData;

    // Inject annual waste data into each feature
    geoData.features.forEach(feature => {
        feature.properties.annualWaste = getAnnualWasteTonnage(wasteData, feature.properties.code);
    });

    // Calculate min/max across ALL years for consistent color scale
    const allTonnages = geoData.features
        .flatMap(f => f.properties.annualWaste.map(d => d.tonnage));

    const minTonnage = d3.min(allTonnages);
    const maxTonnage = d3.max(allTonnages);

    colorScale = d3.scaleSequential()
        .domain([minTonnage, maxTonnage])
        .interpolator(d3.interpolateYlOrRd);

    // Draw map with initial year 2009
    drawMap(2009);

    // Add slider event listener
    d3.select("#yearSlider").on("input", function() {
        const year = parseInt(this.value);

        // Update year label
        d3.select("#yearLabel").text(year);

        // Redraw map with new year
        drawMap(year);
    });

    console.log("Map and data loaded successfully!");
})
.catch(error => {
    console.error("Error loading data:", error);
});

