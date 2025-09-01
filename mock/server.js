const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Define all zones your app uses
const zones = [
  { id: 2, name: "Zone 2", totalSeats: 10 },
  { id: 11, name: "Zone 11", totalSeats: 8 },
  { id: 14, name: "De zolder", totalSeats: 12 },
];

// Helper to generate seat grid for a zone
function generateSeatMap(zone) {
  const image_width = 20;  // mock grid width
  const image_height = 15; // mock grid height

  const seats = {};
  for (let i = 0; i < zone.totalSeats; i++) {
    seats[i + 1] = {
      id: i + 1,
      x: Math.floor(Math.random() * (image_width - 1)) + 1,
      y: Math.floor(Math.random() * (image_height - 1)) + 1,
      width: 1,
      height: 1,
      rotation: 0,
      available: Math.random() > 0.2, // ~80% chance seat is free
    };
  }

  return { image_width, image_height, seats };
}

// Endpoint: /api/zones/:zoneId/map
app.get("/api/zones/:zoneId/map", (req, res) => {
  const zoneId = parseInt(req.params.zoneId);

  const zone = zones.find((z) => z.id === zoneId);
  if (!zone) {
    return res.status(404).json({ message: "Zone not found" });
  }

  const mapFilePath = path.join(__dirname, "../resources/maps/zones", `${zoneId}`, "rectangles.json");

  fs.readFile(mapFilePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ message: "Map file not found" });
      }
      return res.status(500).json({ message: "Error reading map file" });
    }

    try {
      const mapData = JSON.parse(data);
      res.json(mapData);
    } catch (parseError) {
      res.status(500).json({ message: "Error parsing map file" });
    }
  });
});
// Optional: existing endpoint for zone availabilities
app.get("/api/zoneavailabilities", (req, res) => {
  const { locationId, zoneId, startDate, startTime } = req.query;

  const zone = zones.find((z) => z.id === parseInt(zoneId));
  if (!zone) {
    return res.status(404).json({ message: "Zone not found" });
  }

  const response = {
    location: { id: parseInt(locationId) || 1, unit: "2Bergen Arenberg" },
    availabilities: Array.from({ length: zone.totalSeats }, (_, i) => ({
      resourceId: 300000 + zone.id * 100 + i,
      resourceName: `${zone.name} Seat ${i + 1}`,
      positionX: Math.floor(Math.random() * 500),
      positionY: Math.floor(Math.random() * 2000),
    })),
    floorPlan: {
      id: zone.id,
      floorPlanUrl: `https://example.com/floorplans/FloorPlan_${zone.id}.png`,
    },
    message: "",
    startDate: startDate || new Date().toISOString().split("T")[0],
    startTime: startTime || "09:00",
    zone: {
      id: zone.id,
      name: zone.name,
      floorPlanId: 0,
      resourceTypeIds: [],
    },
  };

  res.json(response);
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
