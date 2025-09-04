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

  let zone = zones.find((z) => z.id === zoneId);
  if (!zone) {
    zone = { id: 2, name: "Zone 2", totalSeats: 10 }
  //   return res.status(404).json({ message: "Zone not found" });
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

  let zone = zones.find((z) => z.id === parseInt(zoneId));
  if (!zone) {
    zone = { id: 2, name: "Zone 2", totalSeats: 10 };
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

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Helper to generate unique IDs
let nextId = 1000000000;
function generateId() {
  return nextId++;
}


app.get("/api/reservations", (req, res) => {
  const today = new Date();
  res.json([
    {
      id: generateId(),
      subject: "CBA - Boekenzaal Seat 101",
      purpose: "",
      resourceId: 301001,
      resourceName: "CBA - Boekenzaal Seat 101",
      startDate: formatDate(today),
      startTime: "09:00",
      endDate: formatDate(today),
      endTime: "10:00",
      participants: [],
      minDurationMinutes: 60,
      maxDurationMinutes: 960,
      isMultiDayReservable: false,
      isEditable: true,
      status: "Booked",
      possibleStartDates: [],
      possibleEndDates: [],
      withCheckIn: false,
    },
    {
      id: generateId(),
      subject: "CBA - Boekenzaal Seat 102",
      purpose: "",
      resourceId: 301002,
      resourceName: "CBA - Boekenzaal Seat 102",
      startDate: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)), // tomorrow
      startTime: "11:00",
      endDate: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      endTime: "12:00",
      participants: [],
      minDurationMinutes: 60,
      maxDurationMinutes: 960,
      isMultiDayReservable: false,
      isEditable: true,
      status: "Booked",
      possibleStartDates: [],
      possibleEndDates: [],
      withCheckIn: false,
    },
    {
      id: generateId(),
      subject: "CBA - Boekenzaal Seat 103",
      purpose: "",
      resourceId: 301003,
      resourceName: "CBA - Boekenzaal Seat 103",
      startDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)), // day after tomorrow
      startTime: "14:00",
      endDate: formatDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
      endTime: "15:00",
      participants: [],
      minDurationMinutes: 60,
      maxDurationMinutes: 960,
      isMultiDayReservable: false,
      isEditable: true,
      status: "Booked",
      possibleStartDates: [],
      possibleEndDates: [],
      withCheckIn: false,
    },
  ]);
});

app.get("/api/resourcetypeavailabilities", (req, res) => {
  res.json({
    "availabilities": [
        {
            "id": 301783,
            "name": "CBA - Boekenzaal Seat 137",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301784,
            "name": "CBA - Boekenzaal Seat 138",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301785,
            "name": "CBA - Boekenzaal Seat 139",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301786,
            "name": "CBA - Boekenzaal Seat 140",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301787,
            "name": "CBA - Boekenzaal Seat 141",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301788,
            "name": "CBA - Boekenzaal Seat 142",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301789,
            "name": "CBA - Boekenzaal Seat 143",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301790,
            "name": "CBA - Boekenzaal Seat 144",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301791,
            "name": "CBA - Boekenzaal Seat 145",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301792,
            "name": "CBA - Boekenzaal Seat 146",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301793,
            "name": "CBA - Boekenzaal Seat 147",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301794,
            "name": "CBA - Boekenzaal Seat 148",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "power socket nearby",
                    "name": "Power socket nearby",
                    "iconType": 0,
                    "icon": "power"
                },
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                },
                {
                    "id": "no study",
                    "name": "No study",
                    "iconType": 1,
                    "icon": "assets/tags/no-study.svg"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301224,
            "name": "CBA - Boekenzaal Seat 149",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301225,
            "name": "CBA - Boekenzaal Seat 150",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301226,
            "name": "CBA - Boekenzaal Seat 151",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301227,
            "name": "CBA - Boekenzaal Seat 152",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301228,
            "name": "CBA - Boekenzaal Seat 153",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301229,
            "name": "CBA - Boekenzaal Seat 154",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301230,
            "name": "CBA - Boekenzaal Seat 155",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301231,
            "name": "CBA - Boekenzaal Seat 156",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301232,
            "name": "CBA - Boekenzaal Seat 157",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301233,
            "name": "CBA - Boekenzaal Seat 158",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301234,
            "name": "CBA - Boekenzaal Seat 159",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301235,
            "name": "CBA - Boekenzaal Seat 160",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301236,
            "name": "CBA - Boekenzaal Seat 161",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301237,
            "name": "CBA - Boekenzaal Seat 162",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        },
        {
            "id": 301238,
            "name": "CBA - Boekenzaal Seat 163",
            "locationId": 1,
            "unit": "2Bergen Arenberg",
            "resourceTypeId": 302,
            "resourceTypeName": "Study Seat",
            "url": "https://bib.kuleuven.be/2bergen/cba/faciliteiten/plattegrond_heropstart_cba",
            "startDate": "2025-09-04",
            "startTime": "",
            "endDate": "2025-09-04",
            "endTime": "",
            "participantCount": 1,
            "minParticipants": 1,
            "maxParticipants": 1,
            "minDurationMinutes": 60,
            "maxDurationMinutes": 960,
            "tags": [
                {
                    "id": "silence",
                    "name": "Silence",
                    "iconType": 0,
                    "icon": "voice_over_off"
                }
            ],
            "favorite": false,
            "exactMatch": true,
            "startSlotAllocation": 8,
            "slotAllocation": "UAAAAAAAAAAAAAUU",
            "reservationRequestRequired": false,
            "isMultiDayReservable": false,
            "matchScore": 13,
            "otherScore": 13,
            "fixedTimes": []
        }
    ],
    "message": ""
  })
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
