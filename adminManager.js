// NgwaNgwa Delivery - Admin Manager
// Handles order display, search, filter, and stats

console.log("📊 Admin Manager loaded");

// ===========================
// STATE MANAGEMENT
// ===========================

let allOrders = [];
let filteredOrders = [];

// ===========================
// LOAD ORDERS FROM LOCALSTORAGE
// ===========================

/**
 * Get all bookings from localStorage
 */
function loadOrders() {
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");
  allOrders = bookingsJSON ? JSON.parse(bookingsJSON) : [];

  // Sort by date (newest first)
  allOrders.sort((a, b) => {
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  filteredOrders = [...allOrders]; // Copy all orders initially

  console.log(`📦 Loaded ${allOrders.length} orders`);

  // Log finalPrice for each order
  allOrders.forEach((order) => {
    if (order.finalPrice) {
      console.log(
        `💵 Order ${order.reference}: Final Price = ₦${order.finalPrice.toLocaleString("en-NG")}`,
      );
    }
  });

  return allOrders;
}

// ===========================
// DISPLAY FUNCTIONS
// ===========================

/**
 * Update statistics dashboard
 */
function updateStats() {
  const stats = {
    total: allOrders.length,
    booked: allOrders.filter((o) => o.status === "Booked").length,
    awaitingPickup: allOrders.filter((o) => o.status === "Awaiting Pickup")
      .length,
    pickedUp: allOrders.filter((o) => o.status === "Picked Up").length,
    inTransit: allOrders.filter((o) => o.status === "In Transit").length,
    delivered: allOrders.filter((o) => o.status === "Delivered").length,
  };

  // Update stat cards (with safety checks)
  const statTotal = document.getElementById("statTotal");
  const statBooked = document.getElementById("statBooked");
  const statInTransit = document.getElementById("statInTransit");
  const statDelivered = document.getElementById("statDelivered");

  if (statTotal) statTotal.textContent = stats.total;
  if (statBooked) statBooked.textContent = stats.booked;
  if (statInTransit) {
    statInTransit.textContent =
      stats.awaitingPickup + stats.pickedUp + stats.inTransit;
  }
  if (statDelivered) statDelivered.textContent = stats.delivered;

  console.log("📊 Stats updated:", stats);
}

/**
 * Render orders table
 */
function renderOrdersTable(orders = filteredOrders) {
  const tbody = document.getElementById("ordersTableBody");
  const emptyState = document.getElementById("emptyState");

  // Clear existing rows
  tbody.innerHTML = "";

  // Show empty state if no orders
  if (orders.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  // Generate table rows
  orders.forEach((order) => {
    const row = createOrderRow(order);
    tbody.appendChild(row);
  });

  console.log(`✅ Rendered ${orders.length} orders`);
}

/**
 * Create a single order row
 */
function createOrderRow(order) {
  const tr = document.createElement("tr");
  tr.dataset.reference = order.reference;

  // Format date
  const date = new Date(order.submittedAt);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Status badge color
  const statusClass = getStatusClass(order.status);

  // Generate rider assignment UI
  const riderAssignmentHTML = generateRiderAssignmentHTML(order);

  tr.innerHTML = `
        <td class="ref-cell">
            <strong>${order.reference}</strong>
        </td>
        <td>
            <div class="customer-info">
                <div>${order.customer.name}</div>
                <small>${order.customer.phone}</small>
            </div>
        </td>
        <td>
            <div class="route-info">
                <div><strong>From:</strong> ${order.pickup.location}</div>
                <div><strong>To:</strong> ${order.delivery.location}</div>
            </div>
        </td>
        <td>
            <div>${order.item.typeLabel}</div>
            <small>${order.item.weightLabel}</small>
        </td>
        <td>
            <select 
                class="status-select ${statusClass}" 
                data-reference="${order.reference}"
                onchange="handleStatusChange(this)"
            >
                <option value="Booked" ${order.status === "Booked" ? "selected" : ""}>Booked</option>
                <option value="Awaiting Pickup" ${order.status === "Awaiting Pickup" ? "selected" : ""}>Awaiting Pickup</option>
                <option value="Picked Up" ${order.status === "Picked Up" ? "selected" : ""}>Picked Up</option>
                <option value="In Transit" ${order.status === "In Transit" ? "selected" : ""}>In Transit</option>
                <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
            </select>
        </td>
        <td class="rider-cell">
            ${riderAssignmentHTML}
        </td>
        <td>${formattedDate}</td>
        <td>
            <button 
                class="btn-icon" 
                onclick="viewOrderDetails('${order.reference}')"
                title="View Details"
            >
                👁️
            </button>
        </td>
    `;

  return tr;
}

/**
 * Generate rider assignment HTML based on order state
 */
function generateRiderAssignmentHTML(order) {
  // Check if rider functions are available
  if (
    typeof getRiderById !== "function" ||
    typeof getAvailableRiders !== "function"
  ) {
    return `<small class="text-muted">Loading riders...</small>`;
  }

  // If rider is already assigned
  if (order.assignedRiderId) {
    const rider = getRiderById(order.assignedRiderId);
    if (rider) {
      return `
                <div class="assigned-rider">
                    <div class="rider-name">🚴 ${rider.name}</div>
                    <small class="rider-phone">${rider.phone}</small>
                    <button 
                        class="btn-unassign" 
                        onclick="handleUnassignRider('${order.reference}')"
                        title="Unassign rider"
                    >
                        ✕
                    </button>
                </div>
            `;
    }
  }

  // If no rider assigned, show dropdown + assign button
  const availableRiders = getAvailableRiders();

  if (availableRiders.length === 0) {
    return `<small class="text-muted">No riders available</small>`;
  }

  return `
        <div class="rider-assignment">
            <select 
                class="rider-select" 
                id="riderSelect-${order.reference}"
                data-reference="${order.reference}"
            >
                <option value="">Select rider...</option>
                ${availableRiders
                  .map(
                    (rider) => `
                    <option value="${rider.id}">
                        ${rider.name} (${rider.vehicleType === "motorcycle" ? "🏍️" : rider.vehicleType === "van" ? "🚐" : "🚚"})
                    </option>
                `,
                  )
                  .join("")}
            </select>
            <button 
                class="btn-assign" 
                onclick="handleAssignRider('${order.reference}')"
            >
                Assign
            </button>
        </div>
    `;
}

/**
 * Get CSS class based on status
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

// ===========================
// SEARCH & FILTER
// ===========================

/**
 * Search orders by reference number
 */
function searchOrders(query) {
  query = query.toLowerCase().trim();

  if (!query) {
    filteredOrders = [...allOrders];
  } else {
    filteredOrders = allOrders.filter((order) => {
      const matchesReference = order.reference.toLowerCase().includes(query);
      const matchesName = order.customer.name.toLowerCase().includes(query);
      const matchesPhone = order.customer.phone.includes(query);

      return matchesReference || matchesName || matchesPhone;
    });

    console.log(`🔍 Searching for: "${query}"`);
    console.log(`📦 Found ${filteredOrders.length} matching orders`);
  }

  // Apply current status filter
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter && statusFilter.value !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === statusFilter.value,
    );
  }

  renderOrdersTable(filteredOrders);
}

/**
 * Filter orders by status
 */
function filterByStatus(status) {
  // Save filter to sessionStorage
  sessionStorage.setItem("admin_status_filter", status);

  if (status === "all") {
    filteredOrders = [...allOrders];
  } else {
    filteredOrders = allOrders.filter((order) => order.status === status);
  }

  // Apply current search query
  const searchQuery = document.getElementById("searchInput").value;
  if (searchQuery) {
    searchOrders(searchQuery);
    return;
  }

  renderOrdersTable(filteredOrders);
  console.log(`📋 Filter: "${status}" - Found ${filteredOrders.length} orders`);
}

// ===========================
// STATUS UPDATE HANDLER
// ===========================

/**
 * Handle status change from dropdown
 * Uses the existing updateDeliveryStatus function from statusUpdater.js
 */
function handleStatusChange(selectElement) {
  const reference = selectElement.dataset.reference;
  const newStatus = selectElement.value;
  const oldStatus = selectElement.dataset.oldStatus || "";

  // Confirmation
  const confirmChange = confirm(
    `Update order ${reference} to "${newStatus}"?\n\nThis will notify the customer.`,
  );

  if (!confirmChange) {
    // Reset to old value
    selectElement.value = oldStatus;
    return;
  }

  // Use the existing updateDeliveryStatus function
  if (typeof updateDeliveryStatus === "function") {
    const success = updateDeliveryStatus(reference, newStatus);

    if (success) {
      // Update local data
      loadOrders();
      updateStats();
      renderOrdersTable(filteredOrders);

      // Success feedback
      selectElement.classList.add("status-updated");
      setTimeout(() => {
        selectElement.classList.remove("status-updated");
      }, 1000);

      console.log(`✅ Status updated: ${reference} → ${newStatus}`);
    } else {
      alert("Failed to update status. Please try again.");
      selectElement.value = oldStatus;
    }
  } else {
    alert("Status update function not available.");
    selectElement.value = oldStatus;
  }
}

// Make it globally available for inline onclick
window.handleStatusChange = handleStatusChange;

// ===========================
// RIDER ASSIGNMENT HANDLERS
// ===========================

/**
 * Handle rider assignment button click
 */
function handleAssignRider(orderReference) {
  const selectElement = document.getElementById(
    `riderSelect-${orderReference}`,
  );

  if (!selectElement) {
    alert("Rider selection not found!");
    return;
  }

  const riderId = selectElement.value;

  if (!riderId) {
    alert("Please select a rider first!");
    return;
  }

  // Get rider details for confirmation
  const rider = getRiderById(riderId);
  if (!rider) {
    alert("Rider not found!");
    return;
  }

  // Confirm assignment
  const confirmAssignment = confirm(
    `Assign ${rider.name} to order ${orderReference}?\n\nVehicle: ${rider.vehicleType}\nPhone: ${rider.phone}`,
  );

  if (!confirmAssignment) {
    return;
  }

  // Assign rider using the global function
  if (typeof assignRiderToOrder === "function") {
    const success = assignRiderToOrder(orderReference, riderId);

    if (success) {
      // Reload and re-render
      loadOrders();
      updateStats();
      renderOrdersTable(filteredOrders);

      // Success feedback
      console.log(`✅ Rider ${riderId} assigned to ${orderReference}`);
    } else {
      alert("Failed to assign rider. Please try again.");
    }
  } else {
    alert("Rider assignment function not available.");
  }
}

/**
 * Handle rider unassignment button click
 */
function handleUnassignRider(orderReference) {
  const confirmUnassign = confirm(
    `Remove rider assignment from order ${orderReference}?`,
  );

  if (!confirmUnassign) {
    return;
  }

  // Unassign rider using the global function
  if (typeof unassignRiderFromOrder === "function") {
    const success = unassignRiderFromOrder(orderReference);

    if (success) {
      // Reload and re-render
      loadOrders();
      updateStats();
      renderOrdersTable(filteredOrders);

      console.log(`✅ Rider unassigned from ${orderReference}`);
    } else {
      alert("Failed to unassign rider. Please try again.");
    }
  } else {
    alert("Rider unassignment function not available.");
  }
}

// Make globally available
window.handleAssignRider = handleAssignRider;
window.handleUnassignRider = handleUnassignRider;

// ===========================
// VIEW ORDER DETAILS
// ===========================

/**
 * Show order details in alert (simple MVP approach)
 */
function viewOrderDetails(reference) {
  const order = allOrders.find((o) => o.reference === reference);
  if (!order) {
    alert("Order not found!");
    return;
  }

  // Get assigned rider details if exists
  let riderInfo = "No rider assigned";
  if (order.assignedRiderId) {
    const rider = getRiderById(order.assignedRiderId);
    if (rider) {
      riderInfo = `${rider.name}\nPhone: ${rider.phone}\nVehicle: ${rider.vehicleType}`;
    }
  }

  const details = `
📦 ORDER DETAILS

Reference: ${order.reference}
Status: ${order.status}

👤 CUSTOMER
Name: ${order.customer.name}
Phone: ${order.customer.phone}

📍 ROUTE
From: ${order.pickup.location}
Method: ${order.pickup.methodLabel}

To: ${order.delivery.location}
Speed: ${order.delivery.speedLabel}

📦 ITEM
Type: ${order.item.typeLabel}
Weight: ${order.item.weightLabel}
${order.item.specialInstructions ? `Instructions: ${order.item.specialInstructions}` : ""}

🚴 ASSIGNED RIDER
${riderInfo}

${order.finalPrice ? `💰 FINAL PRICE\n₦${order.finalPrice.toLocaleString("en-NG")}` : order.pricing ? `💰 PRICING\nEstimated: ₦${order.pricing.total.toLocaleString("en-NG")}` : ""}

📅 TIMELINE
${order.timeline.map((t) => `• ${t.stage}: ${new Date(t.timestamp).toLocaleString("en-GB")}${t.details ? ` - ${t.details}` : ""}`).join("\n")}
    `.trim();

  alert(details);
}

// Make it globally available for inline onclick
window.viewOrderDetails = viewOrderDetails;

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing Admin Dashboard...");

  // Load orders
  loadOrders();

  // Update stats
  updateStats();

  // Get status filter element
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchInput");

  // Restore previous filter selection
  const savedFilter = sessionStorage.getItem("admin_status_filter");

  if (savedFilter && statusFilter) {
    console.log(`📋 Restoring filter: ${savedFilter}`);
    statusFilter.value = savedFilter;
    // Apply the filter
    filterByStatus(savedFilter);
  } else {
    // Render table with all orders
    console.log("📋 Rendering all orders");
    renderOrdersTable();
  }

  // Set up search
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchOrders(e.target.value);
    });
  }

  // Set up status filter
  if (statusFilter) {
    statusFilter.addEventListener("change", function (e) {
      filterByStatus(e.target.value);
    });
  }

  console.log("✅ Admin Dashboard ready!");
});
