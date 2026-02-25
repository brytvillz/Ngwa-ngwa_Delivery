// NgwaNgwa Delivery - Riders Management
// Manages rider data and assignments

console.log("🚴 Riders Manager loaded");

// ===========================
// RIDERS DATA STRUCTURE
// ===========================

/**
 * Rider Object Structure:
 * {
 *   id: "RIDER-001",
 *   name: "Chukwudi Okafor",
 *   phone: "08012345678",
 *   vehicleType: "motorcycle", // motorcycle, van, truck
 *   availability: "available" // available, on-delivery, offline
 * }
 */

// ===========================
// INITIALIZE SAMPLE RIDERS
// ===========================

/**
 * Initialize riders data if not already in localStorage
 * This runs once on first load
 */
function initializeRiders() {
  const existingRiders = localStorage.getItem("ngwangwa_riders");

  // If riders already exist, don't overwrite
  if (existingRiders) {
    console.log("✅ Riders already initialized");
    return;
  }

  // Sample riders for Enugu
  const defaultRiders = [
    {
      id: "RIDER-001",
      name: "Chukwudi Okafor",
      phone: "08012345678",
      vehicleType: "motorcycle",
      availability: "available",
    },
    {
      id: "RIDER-002",
      name: "Adaeze Nwankwo",
      phone: "08023456789",
      vehicleType: "motorcycle",
      availability: "available",
    },
    {
      id: "RIDER-003",
      name: "Emeka Eze",
      phone: "08034567890",
      vehicleType: "van",
      availability: "available",
    },
    {
      id: "RIDER-004",
      name: "Ngozi Okonkwo",
      phone: "08045678901",
      vehicleType: "motorcycle",
      availability: "on-delivery",
    },
    {
      id: "RIDER-005",
      name: "Ifeanyi Mbah",
      phone: "08056789012",
      vehicleType: "van",
      availability: "available",
    },
    {
      id: "RIDER-006",
      name: "Chioma Udeh",
      phone: "08067890123",
      vehicleType: "motorcycle",
      availability: "offline",
    },
  ];

  // Save to localStorage
  localStorage.setItem("ngwangwa_riders", JSON.stringify(defaultRiders));
  console.log(`✅ Initialized ${defaultRiders.length} riders`);
}

// ===========================
// RIDER CRUD OPERATIONS
// ===========================

/**
 * Get all riders from localStorage
 */
function getAllRiders() {
  const ridersJSON = localStorage.getItem("ngwangwa_riders");
  return ridersJSON ? JSON.parse(ridersJSON) : [];
}

/**
 * Get available riders (not offline)
 */
function getAvailableRiders() {
  const allRiders = getAllRiders();
  return allRiders.filter((rider) => rider.availability !== "offline");
}

/**
 * Get rider by ID
 */
function getRiderById(riderId) {
  const allRiders = getAllRiders();
  return allRiders.find((rider) => rider.id === riderId);
}

/**
 * Update rider availability
 */
function updateRiderAvailability(riderId, newAvailability) {
  const allRiders = getAllRiders();
  const riderIndex = allRiders.findIndex((rider) => rider.id === riderId);

  if (riderIndex === -1) {
    console.error(`Rider ${riderId} not found`);
    return false;
  }

  allRiders[riderIndex].availability = newAvailability;
  localStorage.setItem("ngwangwa_riders", JSON.stringify(allRiders));

  console.log(
    `✅ Rider ${riderId} availability updated to: ${newAvailability}`,
  );
  return true;
}

/**
 * Add new rider
 */
function addRider(riderData) {
  const allRiders = getAllRiders();

  // Generate new ID
  const newId = `RIDER-${String(allRiders.length + 1).padStart(3, "0")}`;

  const newRider = {
    id: newId,
    name: riderData.name,
    phone: riderData.phone,
    vehicleType: riderData.vehicleType,
    availability: "available",
  };

  allRiders.push(newRider);
  localStorage.setItem("ngwangwa_riders", JSON.stringify(allRiders));

  console.log(`✅ New rider added: ${newId}`);
  return newRider;
}

// ===========================
// RIDER ASSIGNMENT FUNCTIONS
// ===========================

/**
 * Assign rider to an order
 * @param {string} orderReference - The order reference ID
 * @param {string} riderId - The rider ID to assign
 */
function assignRiderToOrder(orderReference, riderId) {
  // Get all bookings
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");
  const bookings = bookingsJSON ? JSON.parse(bookingsJSON) : [];

  // Find the order
  const orderIndex = bookings.findIndex(
    (booking) => booking.reference === orderReference,
  );

  if (orderIndex === -1) {
    console.error(`Order ${orderReference} not found`);
    return false;
  }

  // Get rider details
  const rider = getRiderById(riderId);
  if (!rider) {
    console.error(`Rider ${riderId} not found`);
    return false;
  }

  // Assign rider to order
  bookings[orderIndex].assignedRiderId = riderId;

  // Add assignment timestamp to timeline
  if (!bookings[orderIndex].timeline) {
    bookings[orderIndex].timeline = [];
  }

  bookings[orderIndex].timeline.push({
    stage: "Rider Assigned",
    timestamp: new Date().toISOString(),
    details: `${rider.name} assigned to delivery`,
  });

  // Save updated bookings
  localStorage.setItem("ngwangwa_bookings", JSON.stringify(bookings));

  console.log(
    `✅ Rider ${riderId} (${rider.name}) assigned to order ${orderReference}`,
  );
  return true;
}

/**
 * Unassign rider from an order
 */
function unassignRiderFromOrder(orderReference) {
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");
  const bookings = bookingsJSON ? JSON.parse(bookingsJSON) : [];

  const orderIndex = bookings.findIndex(
    (booking) => booking.reference === orderReference,
  );

  if (orderIndex === -1) {
    console.error(`Order ${orderReference} not found`);
    return false;
  }

  // Remove assignment
  bookings[orderIndex].assignedRiderId = null;

  // Add to timeline
  bookings[orderIndex].timeline.push({
    stage: "Rider Unassigned",
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem("ngwangwa_bookings", JSON.stringify(bookings));

  console.log(`✅ Rider unassigned from order ${orderReference}`);
  return true;
}

/**
 * Get all orders assigned to a specific rider
 */
function getOrdersByRider(riderId) {
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");
  const bookings = bookingsJSON ? JSON.parse(bookingsJSON) : [];

  return bookings.filter((booking) => booking.assignedRiderId === riderId);
}

// ===========================
// INITIALIZATION
// ===========================

// Initialize riders on page load
initializeRiders();

// Make functions available globally
window.getAllRiders = getAllRiders;
window.getAvailableRiders = getAvailableRiders;
window.getRiderById = getRiderById;
window.updateRiderAvailability = updateRiderAvailability;
window.addRider = addRider;
window.assignRiderToOrder = assignRiderToOrder;
window.unassignRiderFromOrder = unassignRiderFromOrder;
window.getOrdersByRider = getOrdersByRider;
