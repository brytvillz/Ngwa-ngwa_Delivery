// NgwaNgwa Delivery - Rider Panel
// Allows riders to view and update their assigned deliveries

console.log("🚴 Rider Panel loaded");

// ===========================
// STATE MANAGEMENT
// ===========================

let currentRiderId = null;
let currentRider = null;
let assignedDeliveries = [];

// ===========================
// RIDER LOGIN
// ===========================

/**
 * Handle rider login
 */
function handleRiderLogin() {
  const riderIdInput = document.getElementById("riderIdInput");
  const riderId = riderIdInput.value.trim();

  if (!riderId) {
    alert("Please enter your Rider ID");
    return;
  }

  // Get rider details using existing function from ridersManager.js
  const rider = getRiderById(riderId);

  if (!rider) {
    alert(
      `Rider ID "${riderId}" not found.\n\nPlease check your ID or contact admin.`,
    );
    return;
  }

  // Store current rider
  currentRiderId = riderId;
  currentRider = rider;

  // Save to sessionStorage (logout clears this)
  sessionStorage.setItem("ngwangwa_rider_id", riderId);

  // Show dashboard
  showDashboard();

  console.log(`✅ Rider logged in: ${rider.name} (${riderId})`);
}

/**
 * Handle rider logout
 */
function handleRiderLogout() {
  const confirmLogout = confirm("Are you sure you want to logout?");

  if (confirmLogout) {
    currentRiderId = null;
    currentRider = null;
    assignedDeliveries = [];

    sessionStorage.removeItem("ngwangwa_rider_id");

    // Hide dashboard, show login
    document.getElementById("riderDashboard").style.display = "none";
    document.getElementById("riderLoginSection").style.display = "block";

    console.log("🚪 Rider logged out");
  }
}

/**
 * Check if rider is already logged in
 */
function checkExistingSession() {
  const savedRiderId = sessionStorage.getItem("ngwangwa_rider_id");

  if (savedRiderId) {
    const rider = getRiderById(savedRiderId);
    if (rider) {
      currentRiderId = savedRiderId;
      currentRider = rider;
      showDashboard();
      console.log("✅ Restored rider session");
    }
  }
}

// ===========================
// DASHBOARD DISPLAY
// ===========================

/**
 * Show rider dashboard
 */
function showDashboard() {
  // Hide login, show dashboard
  document.getElementById("riderLoginSection").style.display = "none";
  document.getElementById("riderDashboard").style.display = "block";

  // Update rider info
  document.getElementById("riderName").textContent = `👤 ${currentRider.name}`;
  document.getElementById("riderInfo").textContent =
    `Rider ID: ${currentRiderId} | Vehicle: ${currentRider.vehicleType} | Phone: ${currentRider.phone}`;

  // Load and display deliveries
  loadAssignedDeliveries();
  updateStats();
  renderDeliveries();
}

/**
 * Load deliveries assigned to current rider
 */
function loadAssignedDeliveries() {
  // Get all bookings from localStorage (EXISTING data store)
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");
  const allBookings = bookingsJSON ? JSON.parse(bookingsJSON) : [];

  // Filter by assigned rider ID
  assignedDeliveries = allBookings.filter(
    (booking) => booking.assignedRiderId === currentRiderId,
  );

  // Sort by date (newest first)
  assignedDeliveries.sort((a, b) => {
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  console.log(
    `📦 Loaded ${assignedDeliveries.length} deliveries for ${currentRiderId}`,
  );
}

/**
 * Update statistics
 */
function updateStats() {
  const total = assignedDeliveries.length;
  const inProgress = assignedDeliveries.filter(
    (d) => d.status !== "Delivered",
  ).length;
  const completed = assignedDeliveries.filter(
    (d) => d.status === "Delivered",
  ).length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statInProgress").textContent = inProgress;
  document.getElementById("statCompleted").textContent = completed;
}

/**
 * Render deliveries list
 */
function renderDeliveries() {
  const deliveriesList = document.getElementById("deliveriesList");
  const emptyState = document.getElementById("emptyState");

  // Clear existing
  deliveriesList.innerHTML = "";

  // Show empty state if no deliveries
  if (assignedDeliveries.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  // Render each delivery
  assignedDeliveries.forEach((delivery) => {
    const deliveryCard = createDeliveryCard(delivery);
    deliveriesList.appendChild(deliveryCard);
  });
}

/**
 * Create delivery card element
 */
function createDeliveryCard(delivery) {
  const card = document.createElement("div");
  card.className = "delivery-card";
  card.dataset.reference = delivery.reference;

  // Format date
  const date = new Date(delivery.submittedAt);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Status color
  const statusClass = getStatusClass(delivery.status);

  // Determine available next statuses
  const nextStatuses = getAvailableStatuses(delivery.status);

  card.innerHTML = `
    <div class="delivery-header">
      <div class="delivery-ref">
        <strong>📦 ${delivery.reference}</strong>
        <span class="delivery-date">${formattedDate}</span>
      </div>
      <span class="status-badge ${statusClass}">${delivery.status}</span>
    </div>

    <div class="delivery-body">
      <div class="delivery-info">
        <div class="info-row">
          <span class="info-label">👤 Customer:</span>
          <span class="info-value">${delivery.customer.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📞 Phone:</span>
          <span class="info-value">${delivery.customer.phone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 From:</span>
          <span class="info-value">${delivery.pickup.location}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 To:</span>
          <span class="info-value">${delivery.delivery.location}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📦 Item:</span>
          <span class="info-value">${delivery.item.typeLabel} (${delivery.item.weightLabel})</span>
        </div>
        <div class="info-row">
          <span class="info-label">🚀 Speed:</span>
          <span class="info-value">${delivery.delivery.speedLabel}</span>
        </div>
      </div>

      ${
        delivery.status !== "Delivered"
          ? `
      <div class="delivery-actions">
        <label class="form-label">Update Status:</label>
        <div class="status-controls">
          ${nextStatuses
            .map(
              (status) => `
            <button 
              class="btn-status ${getStatusButtonClass(status)}"
              onclick="updateDeliveryStatusRider('${delivery.reference}', '${status}')"
            >
              ${getStatusIcon(status)} ${status}
            </button>
          `,
            )
            .join("")}
        </div>
      </div>
      `
          : `
      <div class="delivery-completed">
        <span class="completed-badge">✅ Delivery Completed</span>
      </div>
      `
      }
    </div>
  `;

  return card;
}

/**
 * Get available next statuses based on current status
 */
function getAvailableStatuses(currentStatus) {
  const statusFlow = {
    Booked: ["Picked Up"],
    "Awaiting Pickup": ["Picked Up"],
    "Picked Up": ["In Transit"],
    "In Transit": ["Delivered"],
    Delivered: [], // No further updates
  };

  return statusFlow[currentStatus] || [];
}

/**
 * Get status CSS class
 */
function getStatusClass(status) {
  const statusMap = {
    Booked: "status-booked",
    "Awaiting Pickup": "status-awaiting",
    "Picked Up": "status-picked",
    "In Transit": "status-transit",
    Delivered: "status-delivered",
  };
  return statusMap[status] || "";
}

/**
 * Get status button class
 */
function getStatusButtonClass(status) {
  const buttonMap = {
    "Picked Up": "btn-pickup",
    "In Transit": "btn-transit",
    Delivered: "btn-delivered",
  };
  return buttonMap[status] || "";
}

/**
 * Get status icon
 */
function getStatusIcon(status) {
  const iconMap = {
    "Picked Up": "📦",
    "In Transit": "🚚",
    Delivered: "✅",
  };
  return iconMap[status] || "📋";
}

// ===========================
// STATUS UPDATE
// ===========================

/**
 * Update delivery status (uses EXISTING updateDeliveryStatus function)
 */
function updateDeliveryStatusRider(reference, newStatus) {
  const delivery = assignedDeliveries.find((d) => d.reference === reference);

  if (!delivery) {
    alert("Delivery not found!");
    return;
  }

  // Confirmation
  const confirmUpdate = confirm(
    `Update delivery ${reference} to "${newStatus}"?\n\nCustomer: ${delivery.customer.name}\nDestination: ${delivery.delivery.location}`,
  );

  if (!confirmUpdate) {
    return;
  }

  // Use EXISTING updateDeliveryStatus function from statusUpdater.js
  if (typeof updateDeliveryStatus === "function") {
    const success = updateDeliveryStatus(reference, newStatus);

    if (success) {
      // Show success feedback
      showSuccessToast(`✅ Status updated to "${newStatus}"`);

      // Reload deliveries from localStorage (single source of truth)
      loadAssignedDeliveries();
      updateStats();
      renderDeliveries();

      console.log(
        `✅ ${reference} updated to ${newStatus} by ${currentRiderId}`,
      );
    } else {
      alert("Failed to update status. Please try again.");
    }
  } else {
    alert("Status update function not available. Please refresh the page.");
  }
}

// Make globally available
window.updateDeliveryStatusRider = updateDeliveryStatusRider;

/**
 * Show success toast notification
 */
function showSuccessToast(message) {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = "success-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Hide and remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing Rider Panel...");

  // Check for existing session
  checkExistingSession();

  // Set up login button
  const loginBtn = document.getElementById("riderLoginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleRiderLogin);
  }

  // Set up logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleRiderLogout);
  }

  // Allow Enter key on login
  const riderIdInput = document.getElementById("riderIdInput");
  if (riderIdInput) {
    riderIdInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleRiderLogin();
      }
    });
  }

  console.log("✅ Rider Panel ready!");
});
