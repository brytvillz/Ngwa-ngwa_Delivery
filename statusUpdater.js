// NgwaNgwa Delivery - Status Updater
// Handles updating delivery status and timeline

console.log("🔄 Status Updater initialized!");

/**
 * Update delivery status for a booking
 * @param {string} referenceId - The booking reference ID
 * @param {string} newStatus - The new status (Booked, Awaiting Pickup, Picked Up, In Transit, Delivered)
 * @returns {boolean} - True if update successful, false otherwise
 */
function updateDeliveryStatus(referenceId, newStatus) {
  console.log(`Updating status for ${referenceId} to: ${newStatus}`);

  // Valid status values
  const validStatuses = [
    "Booked",
    "Awaiting Pickup",
    "Picked Up",
    "In Transit",
    "Delivered",
  ];

  // Validate status
  if (!validStatuses.includes(newStatus)) {
    console.error("Invalid status:", newStatus);
    return false;
  }

  // Get all bookings from localStorage
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");

  if (!bookingsJSON) {
    console.error("No bookings found in localStorage");
    return false;
  }

  const bookings = JSON.parse(bookingsJSON);

  // Find booking index
  const bookingIndex = bookings.findIndex(
    (booking) => booking.reference === referenceId,
  );

  if (bookingIndex === -1) {
    console.error("Booking not found:", referenceId);
    return false;
  }

  // Get booking
  const booking = bookings[bookingIndex];

  // Prevent further status updates after Delivered
  if (booking.status === "Delivered") {
    console.warn("Cannot update status: Order is already delivered");
    alert(
      "This order has already been delivered. No further status updates allowed.",
    );
    return false;
  }

  // Don't allow backward status progression
  const statusOrder = [
    "Booked",
    "Awaiting Pickup",
    "Picked Up",
    "In Transit",
    "Delivered",
  ];
  const currentStatusIndex = statusOrder.indexOf(booking.status);
  const newStatusIndex = statusOrder.indexOf(newStatus);

  if (newStatusIndex < currentStatusIndex) {
    console.warn(
      "Cannot move to an earlier status. Current:",
      booking.status,
      "| Requested:",
      newStatus,
    );
    return false;
  }

  // Prevent duplicate consecutive statuses
  if (booking.status === newStatus) {
    console.warn("Status is already set to:", newStatus, "- No update needed");
    return false;
  }

  // Update status
  booking.status = newStatus;

  // Initialize timeline array if it doesn't exist (backward compatibility)
  if (!Array.isArray(booking.timeline)) {
    booking.timeline = [
      {
        stage: "Booked",
        timestamp: booking.submittedAt || new Date().toISOString(),
      },
    ];
  }

  // Add to timeline (prevent duplicate consecutive entries)
  const lastTimelineEntry = booking.timeline[booking.timeline.length - 1];
  if (!lastTimelineEntry || lastTimelineEntry.stage !== newStatus) {
    booking.timeline.push({
      stage: newStatus,
      timestamp: new Date().toISOString(),
    });
  }

  // Automatically set estimated delivery time when status becomes "Picked Up"
  if (newStatus === "Picked Up" && !booking.estimatedDeliveryTime) {
    const currentTime = new Date();
    const estimatedTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    booking.estimatedDeliveryTime = estimatedTime.toISOString();
    console.log(
      `📅 Estimated delivery time set: ${estimatedTime.toLocaleString("en-GB")}`,
    );
  }

  // Set delivered time when status becomes "Delivered"
  if (newStatus === "Delivered" && !booking.deliveredTime) {
    booking.deliveredTime = new Date().toISOString();
    console.log(
      `✅ Delivered time recorded: ${new Date(booking.deliveredTime).toLocaleString("en-GB")}`,
    );
  }

  // Update booking in array
  bookings[bookingIndex] = booking;

  // Save back to localStorage
  localStorage.setItem("ngwangwa_bookings", JSON.stringify(bookings));

  console.log(
    `✅ Status updated successfully for ${referenceId}: ${newStatus}`,
  );
  console.log("Updated booking:", booking);

  return true;
}

/**
 * Get current status of a booking
 * @param {string} referenceId - The booking reference ID
 * @returns {string|null} - Current status or null if not found
 */
function getBookingStatus(referenceId) {
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");

  if (!bookingsJSON) {
    return null;
  }

  const bookings = JSON.parse(bookingsJSON);
  const booking = bookings.find((booking) => booking.reference === referenceId);

  return booking ? booking.status : null;
}

/**
 * Get full booking timeline
 * @param {string} referenceId - The booking reference ID
 * @returns {Array|null} - Timeline array or null if not found
 */
function getBookingTimeline(referenceId) {
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");

  if (!bookingsJSON) {
    return null;
  }

  const bookings = JSON.parse(bookingsJSON);
  const booking = bookings.find((booking) => booking.reference === referenceId);

  return booking ? booking.timeline : null;
}

/**
 * Batch update multiple bookings (for testing/demo purposes)
 * @param {Array} updates - Array of {referenceId, newStatus} objects
 */
function batchUpdateStatuses(updates) {
  console.log("Batch updating statuses:", updates);

  let successCount = 0;
  let failCount = 0;

  updates.forEach((update) => {
    const success = updateDeliveryStatus(update.referenceId, update.newStatus);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(
    `Batch update complete: ${successCount} succeeded, ${failCount} failed`,
  );

  return { successCount, failCount };
}

// Make functions available globally for console testing
window.updateDeliveryStatus = updateDeliveryStatus;
window.getBookingStatus = getBookingStatus;
window.getBookingTimeline = getBookingTimeline;
window.batchUpdateStatuses = batchUpdateStatuses;
