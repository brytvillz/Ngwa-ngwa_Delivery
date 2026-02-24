// NgwaNgwa Delivery - Bookings Manager
// Handles displaying and filtering all user bookings

console.log("📋 Bookings Manager initialized!");

let currentFilter = "all";
let allBookings = [];

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("My Bookings page ready");

  // Load and display bookings
  loadBookings();

  // Set up filter buttons
  setupFilterButtons();
});

/**
 * Load all bookings from localStorage
 */
function loadBookings() {
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");

  if (!bookingsJSON) {
    allBookings = [];
    displayEmptyState();
    displayStats();
    return;
  }

  allBookings = JSON.parse(bookingsJSON);

  // Sort by most recent first
  allBookings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  console.log(`📦 Loaded ${allBookings.length} bookings`);

  // Display stats and bookings
  displayStats();
  displayBookings(allBookings);
}

/**
 * Display statistics overview
 */
function displayStats() {
  const statsSection = document.getElementById("statsSection");

  if (!statsSection) return;

  if (allBookings.length === 0) {
    statsSection.style.display = "none";
    return;
  }

  // Count bookings by status
  const statusCounts = {
    total: allBookings.length,
    Booked: 0,
    "Awaiting Pickup": 0,
    "Picked Up": 0,
    "In Transit": 0,
    Delivered: 0,
  };

  allBookings.forEach((booking) => {
    if (statusCounts.hasOwnProperty(booking.status)) {
      statusCounts[booking.status]++;
    }
  });

  statsSection.style.display = "block";
  statsSection.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card stat-total">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <div class="stat-value">${statusCounts.total}</div>
                    <div class="stat-label">Total Bookings</div>
                </div>
            </div>
            <div class="stat-card stat-in-transit">
                <div class="stat-icon">🚚</div>
                <div class="stat-content">
                    <div class="stat-value">${statusCounts["In Transit"]}</div>
                    <div class="stat-label">In Transit</div>
                </div>
            </div>
            <div class="stat-card stat-delivered">
                <div class="stat-icon">✓</div>
                <div class="stat-content">
                    <div class="stat-value">${statusCounts.Delivered}</div>
                    <div class="stat-label">Delivered</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display bookings list
 */
function displayBookings(bookings) {
  const bookingsSection = document.getElementById("bookingsSection");

  if (!bookingsSection) return;

  if (bookings.length === 0) {
    displayEmptyState();
    return;
  }

  const bookingsHTML = bookings
    .map((booking) => generateBookingCard(booking))
    .join("");

  bookingsSection.innerHTML = `
        <div class="bookings-list">
            ${bookingsHTML}
        </div>
    `;

  // Add click handlers to booking cards
  addBookingClickHandlers();
}

/**
 * Generate individual booking card
 */
function generateBookingCard(booking) {
  const statusClass = booking.status.toLowerCase().replace(/\s+/g, "-");
  const submittedDate = formatDate(booking.submittedAt);
  const latestUpdate = getLatestUpdate(booking);

  return `
        <div class="booking-card" data-reference="${booking.reference}">
            <div class="booking-card-header">
                <div class="booking-reference-badge">
                    ${booking.reference}
                </div>
                <div class="booking-status-badge status-${statusClass}">
                    ${booking.status}
                </div>
            </div>

            <div class="booking-card-body">
                <div class="booking-route">
                    <div class="route-point">
                        <span class="route-icon">📍</span>
                        <div class="route-details">
                            <div class="route-label">From</div>
                            <div class="route-value">${booking.pickup.location}</div>
                        </div>
                    </div>
                    <div class="route-arrow">→</div>
                    <div class="route-point">
                        <span class="route-icon">🎯</span>
                        <div class="route-details">
                            <div class="route-label">To</div>
                            <div class="route-value">${booking.delivery.location}</div>
                        </div>
                    </div>
                </div>

                <div class="booking-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📦</span>
                        <span class="meta-text">${booking.item.typeLabel}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">⚖️</span>
                        <span class="meta-text">${booking.item.weightLabel}</span>
                    </div>
                </div>

                <div class="booking-footer">
                    <div class="booking-date">
                        <span class="date-label">Booked:</span>
                        <span class="date-value">${submittedDate}</span>
                    </div>
                    ${
                      latestUpdate
                        ? `
                    <div class="booking-update">
                        <span class="update-label">Last update:</span>
                        <span class="update-value">${latestUpdate}</span>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>

            <div class="booking-card-actions">
                <button class="btn-card btn-card-primary" onclick="viewBookingDetails('${booking.reference}')">
                    View Details →
                </button>
            </div>
        </div>
    `;
}

/**
 * Display empty state when no bookings
 */
function displayEmptyState() {
  const bookingsSection = document.getElementById("bookingsSection");

  if (!bookingsSection) return;

  bookingsSection.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3 class="empty-title">No Bookings Yet</h3>
            <p class="empty-text">
                You haven't made any delivery requests yet. Start by booking your first delivery!
            </p>
            <a href="index.html" class="btn btn-primary">
                Book a Delivery
            </a>
        </div>
    `;
}

/**
 * Set up filter button handlers
 */
function setupFilterButtons() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const filter = this.getAttribute("data-filter");
      applyFilter(filter);

      // Update active state
      filterButtons.forEach((btn) => btn.classList.remove("filter-btn-active"));
      this.classList.add("filter-btn-active");
    });
  });
}

/**
 * Apply filter to bookings list
 */
function applyFilter(filter) {
  currentFilter = filter;
  console.log("Applying filter:", filter);

  let filteredBookings = allBookings;

  if (filter !== "all") {
    filteredBookings = allBookings.filter(
      (booking) => booking.status === filter,
    );
  }

  displayBookings(filteredBookings);

  // Update filter button counts
  updateFilterCounts();
}

/**
 * Update filter button counts
 */
function updateFilterCounts() {
  const statusCounts = {
    all: allBookings.length,
    Booked: 0,
    "Awaiting Pickup": 0,
    "Picked Up": 0,
    "In Transit": 0,
    Delivered: 0,
  };

  allBookings.forEach((booking) => {
    if (statusCounts.hasOwnProperty(booking.status)) {
      statusCounts[booking.status]++;
    }
  });

  // Update button text with counts (optional enhancement)
  Object.keys(statusCounts).forEach((status) => {
    const button = document.querySelector(`[data-filter="${status}"]`);
    if (button && statusCounts[status] > 0) {
      const baseText = button.textContent.split(" (")[0];
      // button.textContent = `${baseText} (${statusCounts[status]})`;
    }
  });
}

/**
 * Add click handlers to booking cards
 */
function addBookingClickHandlers() {
  const bookingCards = document.querySelectorAll(".booking-card");

  bookingCards.forEach((card) => {
    // Make entire card clickable except buttons
    card.addEventListener("click", function (e) {
      // Don't trigger if clicking on a button
      if (e.target.classList.contains("btn-card")) {
        return;
      }

      const reference = this.getAttribute("data-reference");
      viewBookingDetails(reference);
    });
  });
}

/**
 * View booking details (redirect to tracking page)
 */
function viewBookingDetails(referenceId) {
  console.log("Viewing details for:", referenceId);

  // Store reference in sessionStorage for tracking page to pick up
  sessionStorage.setItem("trackingReference", referenceId);

  // Redirect to tracking page
  window.location.href = "tracking.html";
}

/**
 * Get latest update timestamp
 */
function getLatestUpdate(booking) {
  if (booking.timeline && booking.timeline.length > 1) {
    const latest = booking.timeline[booking.timeline.length - 1];
    return formatRelativeTime(latest.timestamp);
  }
  return null;
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-NG", options);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatDate(isoString);
}

// Make functions available globally
window.viewBookingDetails = viewBookingDetails;
window.loadBookings = loadBookings;
