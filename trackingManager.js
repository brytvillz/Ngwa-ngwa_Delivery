// NgwaNgwa Delivery - Tracking Manager
// Handles shipment lookup and display

console.log("📦 Tracking Manager initialized!");

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Tracking page ready");

  // Get tracking form
  const trackingForm = document.getElementById("trackingForm");

  if (trackingForm) {
    trackingForm.addEventListener("submit", handleTrackingSubmit);
  }

  // Auto-format reference input as user types
  const referenceInput = document.getElementById("referenceInput");
  if (referenceInput) {
    referenceInput.addEventListener("input", formatReferenceInput);
  }

  // Check if we have a reference from My Bookings page
  const storedReference = sessionStorage.getItem("trackingReference");
  if (storedReference && referenceInput) {
    console.log("Auto-loading booking:", storedReference);
    referenceInput.value = storedReference;
    sessionStorage.removeItem("trackingReference");

    // Auto-submit the form
    const booking = findBookingByReference(storedReference);
    if (booking) {
      displayTrackingResults(booking);
    }
  }
});

/**
 * Format reference input in real-time (uppercase)
 */
function formatReferenceInput(event) {
  const input = event.target;
  input.value = input.value.toUpperCase();
}

/**
 * Handle tracking form submission
 */
function handleTrackingSubmit(event) {
  event.preventDefault();

  console.log("🔍 Tracking form submitted");

  // Clear any previous errors
  clearTrackingError();

  // Get reference input
  const referenceInput = document.getElementById("referenceInput");
  const referenceId = referenceInput.value.trim();

  // Validate reference format
  const referencePattern = /^NGW-ENU-\d{8}-\d{3}$/;

  if (!referenceId) {
    showTrackingError("Please enter a booking reference");
    return;
  }

  if (!referencePattern.test(referenceId)) {
    showTrackingError(
      "Invalid reference format. Should be: NGW-ENU-YYYYMMDD-XXX",
    );
    return;
  }

  // Search for booking
  const booking = findBookingByReference(referenceId);

  if (!booking) {
    showTrackingError(
      `No booking found with reference: ${referenceId}. Please check and try again.`,
    );
    return;
  }

  // Display booking details
  displayTrackingResults(booking);
}

/**
 * Find booking by reference ID in localStorage
 */
function findBookingByReference(referenceId) {
  // Get all bookings from localStorage
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");

  if (!bookingsJSON) {
    console.log("No bookings found in localStorage");
    return null;
  }

  const bookings = JSON.parse(bookingsJSON);

  // Find booking with matching reference
  const booking = bookings.find((booking) => booking.reference === referenceId);

  if (booking) {
    console.log("✅ Booking found:", booking);
  } else {
    console.log("❌ Booking not found for reference:", referenceId);
  }

  return booking || null;
}

/**
 * Display tracking results
 */
function displayTrackingResults(booking) {
  console.log("📊 Displaying tracking results for:", booking.reference);

  // Hide search section
  const searchSection = document.getElementById("trackingSearchSection");
  if (searchSection) {
    searchSection.style.display = "none";
  }

  // Show results section
  const resultsSection = document.getElementById("trackingResultsSection");
  if (resultsSection) {
    resultsSection.style.display = "block";
    resultsSection.innerHTML = generateTrackingResultsHTML(booking);
  }

  // Add event listener to "Track Another" button
  const trackAnotherBtn = document.getElementById("trackAnotherBtn");
  if (trackAnotherBtn) {
    trackAnotherBtn.addEventListener("click", resetTrackingForm);
  }

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Generate tracking results HTML
 */
function generateTrackingResultsHTML(booking) {
  return `
        <div class="tracking-results">
            <!-- Header -->
            <div class="tracking-header">
                <div class="tracking-status-badge status-${booking.status.toLowerCase().replace(/\s+/g, "-")}">
                    ${booking.status}
                </div>
                <h2 class="tracking-title">Shipment Tracking</h2>
                <div class="tracking-reference">
                    <span class="reference-label">Reference:</span>
                    <span class="reference-number">${booking.reference}</span>
                </div>
            </div>

            <!-- Current Status Card -->
            <div class="status-card">
                <div class="status-icon">📦</div>
                <h3 class="status-heading">Current Status</h3>
                <p class="status-message">${getStatusMessage(booking.status)}</p>
                <p class="status-timestamp">Last updated: ${formatTimestamp(getLatestTimestamp(booking))}</p>
            </div>

            <!-- Delivery Timeline -->
            ${renderTimeline(booking)}

            <!-- Booking Summary -->
            <div class="tracking-summary">
                <h3 class="summary-heading">📋 Booking Details</h3>
                
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">From:</span>
                        <span class="summary-value">${booking.pickup.location}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Pickup Method:</span>
                        <span class="summary-value">${booking.pickup.methodLabel}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">To:</span>
                        <span class="summary-value">${booking.delivery.location}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Item Type:</span>
                        <span class="summary-value">${booking.item.typeLabel}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Weight:</span>
                        <span class="summary-value">${booking.item.weightLabel}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Delivery Speed:</span>
                        <span class="summary-value">${booking.delivery.speedLabel}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Customer:</span>
                        <span class="summary-value">${booking.customer.name}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Phone:</span>
                        <span class="summary-value">${booking.customer.phone}</span>
                    </div>
                    ${
                      booking.item.specialInstructions
                        ? `
                    <div class="summary-item summary-item-full">
                        <span class="summary-label">Special Instructions:</span>
                        <span class="summary-value">${booking.item.specialInstructions}</span>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>

            <!-- Actions -->
            <div class="tracking-actions">
                <button type="button" class="btn btn-secondary" id="trackAnotherBtn">
                    ← Track Another Shipment
                </button>
            </div>
        </div>
    `;
}

/**
 * Get status-specific message
 */
function getStatusMessage(status) {
  const messages = {
    Booked:
      "Your booking has been confirmed. We'll contact you shortly to arrange pickup/drop-off.",
    "Awaiting Pickup":
      "Your item is waiting to be collected. Please drop it off at our hub or wait for rider pickup.",
    "Picked Up":
      "Your item has been picked up and is being prepared for dispatch.",
    "In Transit":
      "Your item is on its way to the destination with our delivery partner.",
    Delivered: "Your item has been successfully delivered! 🎉",
  };

  return messages[status] || "Status information not available.";
}

/**
 * Get latest timestamp from timeline
 */
function getLatestTimestamp(booking) {
  if (booking.timeline && booking.timeline.length > 0) {
    return booking.timeline[booking.timeline.length - 1].timestamp;
  }
  return booking.submittedAt;
}

/**
 * Format ISO timestamp to human-readable format
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-NG", options);
}

/**
 * Reset tracking form to search again
 */
function resetTrackingForm() {
  // Show search section
  const searchSection = document.getElementById("trackingSearchSection");
  if (searchSection) {
    searchSection.style.display = "block";
  }

  // Hide results section
  const resultsSection = document.getElementById("trackingResultsSection");
  if (resultsSection) {
    resultsSection.style.display = "none";
    resultsSection.innerHTML = "";
  }

  // Clear input
  const referenceInput = document.getElementById("referenceInput");
  if (referenceInput) {
    referenceInput.value = "";
    referenceInput.focus();
  }

  // Clear any errors
  clearTrackingError();

  // Scroll to top
  searchSection.scrollIntoView({ behavior: "smooth", block: "start" });

  console.log("Tracking form reset");
}

/**
 * Show tracking error message
 */
function showTrackingError(message) {
  const errorElement = document.getElementById("referenceError");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

/**
 * Clear tracking error message
 */
function clearTrackingError() {
  const errorElement = document.getElementById("referenceError");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}
