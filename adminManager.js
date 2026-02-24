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

  // Update stat cards
  document.getElementById("statTotal").textContent = stats.total;
  document.getElementById("statBooked").textContent = stats.booked;
  document.getElementById("statInTransit").textContent =
    stats.awaitingPickup + stats.pickedUp + stats.inTransit;
  document.getElementById("statDelivered").textContent = stats.delivered;

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
      return (
        order.reference.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.includes(query)
      );
    });
  }

  // Apply current status filter
  const statusFilter = document.getElementById("statusFilter").value;
  if (statusFilter !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.status === statusFilter,
    );
  }

  renderOrdersTable(filteredOrders);
  console.log(`🔍 Search: "${query}" - Found ${filteredOrders.length} orders`);
}

/**
 * Filter orders by status
 */
function filterByStatus(status) {
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

${order.pricing ? `💰 PRICING\nEstimated: ₦${order.pricing.total.toLocaleString("en-NG")}` : ""}

📅 TIMELINE
${order.timeline.map((t) => `• ${t.stage}: ${new Date(t.timestamp).toLocaleString("en-GB")}`).join("\n")}
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

  // Render table
  renderOrdersTable();

  // Set up search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchOrders(e.target.value);
    });
  }

  // Set up status filter
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function (e) {
      filterByStatus(e.target.value);
    });
  }

  console.log("✅ Admin Dashboard ready!");
});
