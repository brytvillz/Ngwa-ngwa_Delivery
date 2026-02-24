// NgwaNgwa Delivery - Location Autocomplete
// Provides autocomplete functionality for location inputs

console.log("🔍 Location Autocomplete initialized!");

/**
 * Initialize autocomplete for a given input field
 * @param {string} inputId - ID of the input element
 * @param {Array} locationData - Array of location strings
 */
function initializeAutocomplete(inputId, locationData) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.error(`Input ${inputId} not found`);
    return;
  }

  // Create autocomplete dropdown container
  const dropdown = document.createElement("div");
  dropdown.className = "autocomplete-dropdown";
  dropdown.id = `${inputId}-dropdown`;
  input.parentNode.insertBefore(dropdown, input.nextSibling);

  // Listen for input changes
  input.addEventListener("input", function () {
    handleAutocomplete(this, locationData, dropdown);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Handle keyboard navigation
  input.addEventListener("keydown", function (e) {
    handleKeyboardNavigation(e, dropdown);
  });
}

/**
 * Handle autocomplete logic
 */
function handleAutocomplete(input, locationData, dropdown) {
  const value = input.value.trim();

  // Hide dropdown if input is too short
  if (value.length < 2) {
    dropdown.style.display = "none";
    return;
  }

  // Filter locations based on input
  const matches = locationData.filter((location) =>
    location.toLowerCase().includes(value.toLowerCase()),
  );

  // Display matches
  if (matches.length > 0) {
    displayMatches(matches, dropdown, input);
  } else {
    dropdown.style.display = "none";
  }
}

/**
 * Display matching locations in dropdown
 */
function displayMatches(matches, dropdown, input) {
  // Limit to 8 results
  const limitedMatches = matches.slice(0, 8);

  dropdown.innerHTML = limitedMatches
    .map(
      (location) => `
        <div class="autocomplete-item" data-value="${location}">
            <span class="autocomplete-icon">📍</span>
            <span class="autocomplete-text">${highlightMatch(location, input.value)}</span>
        </div>
    `,
    )
    .join("");

  // Show dropdown
  dropdown.style.display = "block";

  // Add click handlers
  const items = dropdown.querySelectorAll(".autocomplete-item");
  items.forEach((item) => {
    item.addEventListener("click", function () {
      selectLocation(this.dataset.value, input, dropdown);
    });
  });
}

/**
 * Highlight matching text
 */
function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<strong class="autocomplete-match">$1</strong>');
}

/**
 * Select a location from dropdown
 */
function selectLocation(location, input, dropdown) {
  input.value = location;
  dropdown.style.display = "none";

  // Trigger validation
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("Selected location:", location);
}

/**
 * Handle keyboard navigation (arrow keys, enter)
 */
function handleKeyboardNavigation(e, dropdown) {
  const items = dropdown.querySelectorAll(".autocomplete-item");
  if (items.length === 0) return;

  let currentIndex = Array.from(items).findIndex((item) =>
    item.classList.contains("active"),
  );

  // Arrow Down
  if (e.key === "ArrowDown") {
    e.preventDefault();
    currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    highlightItem(items, currentIndex);
  }

  // Arrow Up
  if (e.key === "ArrowUp") {
    e.preventDefault();
    currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    highlightItem(items, currentIndex);
  }

  // Enter
  if (e.key === "Enter" && currentIndex >= 0) {
    e.preventDefault();
    items[currentIndex].click();
  }

  // Escape
  if (e.key === "Escape") {
    dropdown.style.display = "none";
  }
}

/**
 * Highlight active item in dropdown
 */
function highlightItem(items, index) {
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add("active");
      item.scrollIntoView({ block: "nearest" });
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Validate if location is in Enugu (for pickup validation)
 */
function isEnuguLocation(location) {
  return window.enuguLocations.some((loc) =>
    loc.toLowerCase().includes(location.toLowerCase()),
  );
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Initialize pickup location autocomplete (Enugu only)
  if (window.enuguLocations) {
    initializeAutocomplete("pickupLocation", window.enuguLocations);
  }

  // Initialize delivery location autocomplete (all Nigerian cities)
  if (window.allDeliveryLocations) {
    initializeAutocomplete("deliveryLocation", window.allDeliveryLocations);
  }

  console.log("✅ Autocomplete initialized for pickup and delivery locations");
});

// Make functions available globally
window.initializeAutocomplete = initializeAutocomplete;
window.isEnuguLocation = isEnuguLocation;
