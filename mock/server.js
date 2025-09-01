const express = require("express");
const cors = require("cors");

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

// Helper to generate random resources
function generateResources(zone) {
  const resources = [];
  for (let i = 0; i < zone.totalSeats; i++) {
    resources.push({
      resourceId: 300000 + zone.id * 100 + i,
      resourceName: `${zone.name} Seat ${i + 1}`,
      positionX: Math.floor(Math.random() * 500),
      positionY: Math.floor(Math.random() * 2000),
    });
  }
  return resources;
}

app.get("/api/zoneavailabilities", (req, res) => {
  const { locationId, zoneId, startDate, startTime } = req.query;

  // Find the requested zone
  const zone = zones.find((z) => z.id === parseInt(zoneId));
  if (!zone) {
    return res.status(404).json({ message: "Zone not found" });
  }

  // Build response in the format of the real API
  const response = {
    location: { id: parseInt(locationId) || 1, unit: "2Bergen Arenberg" },
    availabilities: generateResources(zone),
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
