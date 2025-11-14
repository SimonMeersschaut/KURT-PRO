import { apiPostFetch, kurt3, kurtpro} from "./client";
import { getUid, getEmail} from "./authentication";
import { fetchReservations, clearReservationCache } from "./reservations";

/**
 * Syncs all reservations with the backend.
 */
async function syncReservations() {
  // try {
  //   Invalidate cache and fetch fresh reservations
  //   clearReservationCache();
  //   const reservations = await fetchReservations();

  //   // TODO: Replace with your actual backend endpoint
  //   const backendUrl = kurtpro + "/api/sync-reservations";

  //   await fetch(backendUrl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(reservations),
  //   });
  // } catch (error) {
  //   console.error("Failed to sync reservations:", error);
  // }
}

/** Format a Date object to YYYY-MM-DD */
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/*
Sends a request to the back-end to make a reservation.
Returns a structured response object: { success: boolean, message: string, data?: object }

URL: https://kurt3.ghum.kuleuven.be/api/reservations/
PAYLOAD: 
    {
        "id":301783,
        "resourceName":"CBA - Boekenzaal Seat 137",
        "subject":"CBA - Boekenzaal Seat 137",
        "purpose":"",
        "resourceId":301783,
        "startDate":"2025-04-22",
        "startTime":"9:00",
        "endDate":"2025-04-22",
        "endTime":"10:00",
        "participants":[{"uid":r-number,"email":email}],
        "summary":["Resource **CBA - Boekenzaal Seat 137**","at **2Bergen Arenberg**","for **<email>&commat;student.kuleuven.be**","from **Tue Apr 22 9:00** until **Tue Apr 22 10:00**"],
        "withCheckIn":false
    }
EXPECTED MESSAGE: "Your reservation has been created. You will receive an e-mail confirmation. The following attendees were validated: R1039801;. (Do not forget to log off on public computers.)"
*/
export default async function makeReservation(seatId, startDate, timeRange) {
  if (!seatId) return { success: false, message: "'seatId' was null or undefined." };
  if (!startDate) return { success: false, message: "'startDate' was null or undefined." };
  if (!timeRange) return { success: false, message: "'timeRange' was null or undefined." };

  const bodyData = {
    id: seatId,
    resourceName: ` - `,
    subject: "",
    purpose: "",
    resourceId: seatId,
    startDate: formatDate(startDate),
    startTime: timeRange.start,
    endDate: formatDate(startDate),
    endTime: timeRange.end,
    participants: [
      {"uid": getUid(), "email":getEmail()}
    ],
    summary: [
      "", "", "", ""
    ],
    withCheckIn: false
  };

  try {
    const response = await apiPostFetch("/api/reservations", bodyData, kurt3, true);
    const responseText = await response.json();

    if (response.ok) {
      const successMessage = "Your reservation has been created.  The following attendees were validated: ";
      if (responseText.startsWith(successMessage)) {
        // Don't await this, let it run in the background
        syncReservations();
        return { success: true, message: successMessage, data: bodyData };
      } else {
        // Unexpected response, but still 200 OK
        console.warn("Unexpected response message:", responseText);
        return { success: false, message: `Unexpected response: ${responseText}` };
      }
    } else {
      // Non-OK response
      let errorMessage = "Unknown error";
      try {
        errorMessage = responseText ? JSON.parse(responseText).details : errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      return {
        success: false,
        message: `Failed with status ${response.status}: ${errorMessage}`
      };
    }
  } catch (err) {
    console.error(err.message)
    return { success: false, message: `Request failed: ${err.message}` };
  }
}