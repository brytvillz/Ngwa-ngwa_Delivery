// NgwaNgwa Delivery - Pricing Calculator
// Calculates estimated delivery prices based on item details

console.log("💰 Pricing Calculator initialized!");

/**
 * Price calculation based on:
 * - Item type (size)
 * - Weight
 * - Delivery speed (standard vs express)
 * - Distance (within Enugu vs outside Enugu)
 */

// Base prices (in Naira)
const PRICING = {
  // Base price by item type
  itemType: {
    document: 800,
    small: 1500,
    medium: 2500,
    large: 4000,
    custom: 3000,
  },

  // Weight multipliers
  weight: {
    under5: 1.0, // No additional charge
    "5to20": 1.3, // +30%
    "20to50": 1.6, // +60%
    over50: 2.0, // +100%
  },

  // Delivery speed multipliers
  speed: {
    standard: 1.0, // Base price
    express: 1.5, // +50%
  },

  // Distance zones (based on pickup/delivery locations)
  distance: {
    withinEnugu: 1.0, // Base price
    enuguToNearby: 1.5, // Nearby states (Anambra, Ebonyi, Abia, Imo) +50%
    enuguToLagos: 2.5, // Lagos/Ogun +150%
    enuguToAbuja: 2.2, // Abuja +120%
    enuguToFar: 2.8, // Other distant states +180%
  },

  // Pickup method fees
  pickupMethod: {
    dropoff: 0, // No additional charge (default)
    rider: 500, // ₦500 for rider pickup
  },
};

/**
 * Calculate delivery price
 * @param {Object} bookingData - The booking data object
 * @returns {Object} - { basePrice, total, breakdown }
 */
function calculatePrice(bookingData) {
  // Get base price from item type
  const basePrice = PRICING.itemType[bookingData.item.type] || 2000;

  // Calculate multipliers
  const weightMultiplier = PRICING.weight[bookingData.item.weight] || 1.0;
  const speedMultiplier = PRICING.speed[bookingData.delivery.speed] || 1.0;
  const distanceMultiplier = getDistanceMultiplier(
    bookingData.pickup.location,
    bookingData.delivery.location,
  );

  // Calculate pickup method fee
  const pickupFee = PRICING.pickupMethod[bookingData.pickup.method] || 0;

  // Calculate total
  const subtotal =
    basePrice * weightMultiplier * speedMultiplier * distanceMultiplier;
  const total = Math.round(subtotal + pickupFee);

  return {
    basePrice,
    weightMultiplier,
    speedMultiplier,
    distanceMultiplier,
    pickupFee,
    subtotal: Math.round(subtotal),
    total,
    breakdown: {
      itemType: basePrice,
      weight: Math.round(basePrice * (weightMultiplier - 1)),
      speed: Math.round(basePrice * weightMultiplier * (speedMultiplier - 1)),
      distance: Math.round(
        basePrice * weightMultiplier * (distanceMultiplier - 1),
      ),
      pickupFee,
    },
  };
}

/**
 * Determine distance multiplier based on locations
 */
function getDistanceMultiplier(pickupLocation, deliveryLocation) {
  const pickup = pickupLocation.toLowerCase();
  const delivery = deliveryLocation.toLowerCase();

  // Both in Enugu
  if (delivery.includes("enugu")) {
    return PRICING.distance.withinEnugu;
  }

  // Lagos/Ogun
  if (delivery.includes("lagos") || delivery.includes("ogun")) {
    return PRICING.distance.enuguToLagos;
  }

  // Abuja/FCT
  if (delivery.includes("abuja") || delivery.includes("fct")) {
    return PRICING.distance.enuguToAbuja;
  }

  // Nearby states (Southeast)
  if (
    delivery.includes("anambra") ||
    delivery.includes("onitsha") ||
    delivery.includes("abia") ||
    delivery.includes("aba") ||
    delivery.includes("imo") ||
    delivery.includes("owerri") ||
    delivery.includes("ebonyi")
  ) {
    return PRICING.distance.enuguToNearby;
  }

  // Other states (far)
  return PRICING.distance.enuguToFar;
}

/**
 * Format price with Naira symbol and commas
 */
function formatPrice(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Generate price estimate display HTML
 */
function generatePriceEstimateHTML(pricing) {
  return `
        <div class="price-estimate">
            <div class="price-header">
                <span class="price-label">Estimated Total:</span>
                <span class="price-amount">${formatPrice(pricing.total)}</span>
            </div>
            <div class="price-breakdown">
                <div class="price-item">
                    <span>Base price (${pricing.breakdown.itemType ? formatPrice(pricing.breakdown.itemType) : ""})</span>
                </div>
                ${
                  pricing.breakdown.weight > 0
                    ? `
                <div class="price-item">
                    <span>Weight adjustment</span>
                    <span>+${formatPrice(pricing.breakdown.weight)}</span>
                </div>
                `
                    : ""
                }
                ${
                  pricing.breakdown.speed > 0
                    ? `
                <div class="price-item">
                    <span>Express delivery</span>
                    <span>+${formatPrice(pricing.breakdown.speed)}</span>
                </div>
                `
                    : ""
                }
                ${
                  pricing.breakdown.distance > 0
                    ? `
                <div class="price-item">
                    <span>Distance</span>
                    <span>+${formatPrice(pricing.breakdown.distance)}</span>
                </div>
                `
                    : ""
                }
                ${
                  pricing.pickupFee > 0
                    ? `
                <div class="price-item">
                    <span>Rider pickup fee</span>
                    <span>+${formatPrice(pricing.pickupFee)}</span>
                </div>
                `
                    : ""
                }
            </div>
            <p class="price-note">
                <strong>Note:</strong> This is an estimate. Final price will be confirmed when we contact you.
            </p>
        </div>
    `;
}

// Make functions available globally
window.calculatePrice = calculatePrice;
window.formatPrice = formatPrice;
window.generatePriceEstimateHTML = generatePriceEstimateHTML;
