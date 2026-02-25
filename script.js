// NgwaNgwa Delivery - Main JavaScript
// Author: Senior Frontend Engineer
// Mobile-first logistics booking application

console.log("NgwaNgwa Delivery initialized! 🚚");

// ===========================
// MULTI-STEP NAVIGATION
// ===========================

let currentStep = 1;
const totalSteps = 3;

// ===========================
// FORM SUBMISSION & VALIDATION
// ===========================

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM ready. Booking flow initialized.");

  // Get form element
  const quoteForm = document.getElementById("quoteForm");

  // Handle form submission
  if (quoteForm) {
    quoteForm.addEventListener("submit", handleFormSubmit);
  }

  // Set up step navigation buttons
  setupStepNavigation();
});

/**
 * Set up event listeners for Next and Back buttons
 */
function setupStepNavigation() {
  // Step 1: Next button
  const step1Next = document.getElementById("step1Next");
  if (step1Next) {
    step1Next.addEventListener("click", function () {
      if (validateStep(1)) {
        goToStep(2);
      }
    });
  }

  // Step 2: Back button
  const step2Back = document.getElementById("step2Back");
  if (step2Back) {
    step2Back.addEventListener("click", function () {
      goToStep(1);
    });
  }

  // Step 2: Next button
  const step2Next = document.getElementById("step2Next");
  if (step2Next) {
    step2Next.addEventListener("click", function () {
      if (validateStep(2)) {
        goToStep(3);
      }
    });
  }

  // Step 3: Back button
  const step3Back = document.getElementById("step3Back");
  if (step3Back) {
    step3Back.addEventListener("click", function () {
      goToStep(2);
    });
  }
}

/**
 * Navigate to a specific step
 */
function goToStep(stepNumber) {
  // Validate step number
  if (stepNumber < 1 || stepNumber > totalSteps) {
    console.error("Invalid step number:", stepNumber);
    return;
  }

  // Update current step
  currentStep = stepNumber;

  // Hide all steps
  const allSteps = document.querySelectorAll(".form-step");
  allSteps.forEach(function (step) {
    step.classList.remove("active");
  });

  // Show current step
  const currentStepElement = document.querySelector(
    `.form-step[data-step="${stepNumber}"]`,
  );
  if (currentStepElement) {
    currentStepElement.classList.add("active");
  }

  // Update progress indicator
  updateProgressIndicator(stepNumber);

  // Scroll to top of form smoothly
  const quoteSection = document.getElementById("quoteSection");
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  console.log("Navigated to step:", stepNumber);
}

/**
 * Update the progress indicator to show current step
 */
function updateProgressIndicator(stepNumber) {
  const allProgressSteps = document.querySelectorAll(".progress-step");

  allProgressSteps.forEach(function (progressStep) {
    const stepNum = parseInt(progressStep.getAttribute("data-step"));

    if (stepNum <= stepNumber) {
      progressStep.classList.add("active");
    } else {
      progressStep.classList.remove("active");
    }
  });
}

/**
 * Validate fields for a specific step
 * Returns true if step is valid, false otherwise
 */
function validateStep(stepNumber) {
  let isValid = true;

  // Clear previous errors for this step
  clearStepErrors(stepNumber);

  if (stepNumber === 1) {
    // Validate Step 1: Pickup & Delivery Locations
    const pickupLocation = document.getElementById("pickupLocation");
    if (
      !pickupLocation.value.trim() ||
      pickupLocation.value.trim().length < 3
    ) {
      showError(
        "pickupLocationError",
        "Please enter a valid pickup location (at least 3 characters)",
      );
      isValid = false;
    }

    const deliveryLocation = document.getElementById("deliveryLocation");
    if (
      !deliveryLocation.value.trim() ||
      deliveryLocation.value.trim().length < 3
    ) {
      showError(
        "deliveryLocationError",
        "Please enter a valid delivery location (at least 3 characters)",
      );
      isValid = false;
    }
  } else if (stepNumber === 2) {
    // Validate Step 2: Item Details
    const itemType = document.getElementById("itemType");
    if (!itemType.value) {
      showError("itemTypeError", "Please select an item type");
      isValid = false;
    }

    const itemWeight = document.getElementById("itemWeight");
    if (!itemWeight.value) {
      showError("itemWeightError", "Please select an estimated weight");
      isValid = false;
    }
  } else if (stepNumber === 3) {
    // Validate Step 3: Contact & Urgency
    const customerName = document.getElementById("customerName");
    if (!customerName.value.trim() || customerName.value.trim().length < 2) {
      showError(
        "customerNameError",
        "Please enter your full name (at least 2 characters)",
      );
      isValid = false;
    }

    const customerPhone = document.getElementById("customerPhone");
    const phonePattern = /^0[7-9][0-1][0-9]{8}$/;

    if (!customerPhone.value.trim()) {
      showError("customerPhoneError", "Please enter your phone number");
      isValid = false;
    } else if (!phonePattern.test(customerPhone.value.trim())) {
      showError(
        "customerPhoneError",
        "Please enter a valid Nigerian mobile number (11 digits, starts with 070-091)",
      );
      isValid = false;
    }
  }

  // If invalid, scroll to first error in this step
  if (!isValid) {
    scrollToFirstError();
  }

  return isValid;
}

/**
 * Clear error messages for a specific step
 */
function clearStepErrors(stepNumber) {
  const stepElement = document.querySelector(
    `.form-step[data-step="${stepNumber}"]`,
  );
  if (stepElement) {
    const errorElements = stepElement.querySelectorAll(".form-error");
    errorElements.forEach(function (element) {
      element.textContent = "";
      element.style.display = "none";
    });
  }
}

/**
 * Main form submission handler
 * Validates all fields and displays success/error messages
 */
function handleFormSubmit(event) {
  // Prevent default form submission (no page reload)
  event.preventDefault();

  console.log("Form submitted - validating...");

  // Clear any previous error messages
  clearAllErrors();

  // Validate all form fields
  const isValid = validateForm();

  if (isValid) {
    // Form is valid - show success message
    showSuccessMessage();
  } else {
    // Form has errors - scroll to first error
    scrollToFirstError();
  }
}

/**
 * Validates all required form fields
 * Returns true if all fields are valid, false otherwise
 */
function validateForm() {
  let isValid = true;

  // Step 1: Validate Pickup Location
  const pickupLocation = document.getElementById("pickupLocation");
  if (!pickupLocation.value.trim() || pickupLocation.value.trim().length < 3) {
    showError(
      "pickupLocationError",
      "Please enter a valid pickup location (at least 3 characters)",
    );
    isValid = false;
  }

  // Step 1: Validate Delivery Location
  const deliveryLocation = document.getElementById("deliveryLocation");
  if (
    !deliveryLocation.value.trim() ||
    deliveryLocation.value.trim().length < 3
  ) {
    showError(
      "deliveryLocationError",
      "Please enter a valid delivery location (at least 3 characters)",
    );
    isValid = false;
  }

  // Step 2: Validate Item Type
  const itemType = document.getElementById("itemType");
  if (!itemType.value) {
    showError("itemTypeError", "Please select an item type");
    isValid = false;
  }

  // Step 2: Validate Item Weight
  const itemWeight = document.getElementById("itemWeight");
  if (!itemWeight.value) {
    showError("itemWeightError", "Please select an estimated weight");
    isValid = false;
  }

  // Step 3: Validate Customer Name
  const customerName = document.getElementById("customerName");
  if (!customerName.value.trim() || customerName.value.trim().length < 2) {
    showError(
      "customerNameError",
      "Please enter your full name (at least 2 characters)",
    );
    isValid = false;
  }

  // Step 3: Validate Phone Number
  const customerPhone = document.getElementById("customerPhone");
  const phonePattern = /^0[7-9][0-1][0-9]{8}$/; // Nigerian mobile format

  if (!customerPhone.value.trim()) {
    showError("customerPhoneError", "Please enter your phone number");
    isValid = false;
  } else if (!phonePattern.test(customerPhone.value.trim())) {
    showError(
      "customerPhoneError",
      "Please enter a valid Nigerian mobile number (11 digits, starts with 070-091)",
    );
    isValid = false;
  }

  // Delivery speed is always valid (has default checked value)

  return isValid;
}

/**
 * Display error message for a specific field
 */
function showError(errorElementId, message) {
  const errorElement = document.getElementById(errorElementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

/**
 * Clear all error messages from the form
 */
function clearAllErrors() {
  const errorElements = document.querySelectorAll(".form-error");
  errorElements.forEach(function (element) {
    element.textContent = "";
    element.style.display = "none";
  });
}

/**
 * Scroll to the first visible error message
 */
function scrollToFirstError() {
  const firstError = document.querySelector(
    '.form-error[style*="display: block"]',
  );
  if (firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ===========================
// DATA COLLECTION & MANAGEMENT
// ===========================

/**
 * Generate a unique booking reference number
 * Format: NGW-ENU-YYYYMMDD-XXX
 * Example: NGW-ENU-20260209-001
 */
function generateBookingReference() {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateString = `${year}${month}${day}`;

  // Get today's booking count from localStorage
  const storageKey = `bookingCount_${dateString}`;
  let bookingCount = parseInt(localStorage.getItem(storageKey) || "0");

  // Increment count
  bookingCount++;

  // Save updated count back to localStorage
  localStorage.setItem(storageKey, bookingCount.toString());

  // Generate reference number with leading zeros (001, 002, etc.)
  const sequenceNumber = String(bookingCount).padStart(3, "0");

  // Format: NGW-ENU-YYYYMMDD-XXX
  const reference = `NGW-ENU-${dateString}-${sequenceNumber}`;

  return reference;
}

/**
 * Collect all form data into a structured object
 * This is the single source of truth for booking data
 */
function collectFormData() {
  // Get selected item type text (not value)
  const itemTypeSelect = document.getElementById("itemType");
  const itemTypeText =
    itemTypeSelect.options[itemTypeSelect.selectedIndex].text;

  // Get selected item weight text (not value)
  const itemWeightSelect = document.getElementById("itemWeight");
  const itemWeightText =
    itemWeightSelect.options[itemWeightSelect.selectedIndex].text;

  // Get selected delivery speed
  const deliverySpeedInput = document.querySelector(
    'input[name="deliverySpeed"]:checked',
  );
  const deliverySpeedValue = deliverySpeedInput
    ? deliverySpeedInput.value
    : "standard";

  // Get selected pickup method
  const pickupMethodInput = document.querySelector(
    'input[name="pickupMethod"]:checked',
  );
  const pickupMethodValue = pickupMethodInput
    ? pickupMethodInput.value
    : "dropoff";

  // Build and return the booking data object
  const bookingData = {
    // Unique booking reference
    reference: generateBookingReference(),

    // Step 1: Location Details
    pickup: {
      location: document.getElementById("pickupLocation").value.trim(),
      method: pickupMethodValue,
      methodLabel:
        pickupMethodValue === "rider"
          ? "Rider Pickup (subject to availability)"
          : "Drop-off at Hub",
    },
    delivery: {
      location: document.getElementById("deliveryLocation").value.trim(),
      speed: deliverySpeedValue,
      speedLabel:
        deliverySpeedValue === "express"
          ? "Express (1-3 days, subject to availability)"
          : "Standard (3-7 days)",
    },

    // Step 2: Item Details
    item: {
      type: itemTypeSelect.value,
      typeLabel: itemTypeText,
      weight: itemWeightSelect.value,
      weightLabel: itemWeightText,
      specialInstructions:
        document.getElementById("specialInstructions").value.trim() || null,
    },

    // Step 3: Customer Details
    customer: {
      name: document.getElementById("customerName").value.trim(),
      phone: document.getElementById("customerPhone").value.trim(),
    },

    // Metadata
    status: "Booked", // Booked, Awaiting Pickup, Picked Up, In Transit, Delivered
    submittedAt: new Date().toISOString(),

    // Rider Assignment
    assignedRiderId: null, // Will be assigned by admin

    // Tracking Timeline
    timeline: [
      {
        stage: "Booked",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  // Calculate pricing if pricing calculator is available
  if (typeof calculatePrice === "function") {
    bookingData.pricing = calculatePrice(bookingData);
    console.log("💰 Pricing calculated:", bookingData.pricing);
  }

  return bookingData;
}

/**
 * Display success message using booking data object
 */
function showSuccessMessage() {
  console.log("✅ Form validation passed!");

  // Collect all form data into structured object
  const bookingData = collectFormData();

  console.log("Booking Data:", bookingData);

  // Save booking to localStorage
  saveBooking(bookingData);

  // Hide the form
  const quoteForm = document.getElementById("quoteForm");
  const progressIndicator = document.querySelector(".progress-indicator");

  if (quoteForm) quoteForm.style.display = "none";
  if (progressIndicator) progressIndicator.style.display = "none";

  // Generate success message HTML using bookingData
  const successHTML = generateSuccessHTML(bookingData);

  // Insert success message into the quote section
  const sectionHeader = document.querySelector(".section-header");
  if (sectionHeader) {
    sectionHeader.insertAdjacentHTML("afterend", successHTML);
  }

  // Scroll to top of quote section smoothly
  const quoteSection = document.getElementById("quoteSection");
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Add event listener to "Request Another Quote" button
  const newQuoteBtn = document.getElementById("newQuoteBtn");
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener("click", resetForm);
  }
}

/**
 * Save booking to localStorage
 */
function saveBooking(bookingData) {
  // Get existing bookings from localStorage
  const bookingsJSON = localStorage.getItem("ngwangwa_bookings");
  const bookings = bookingsJSON ? JSON.parse(bookingsJSON) : [];

  // Add new booking to the array
  bookings.push(bookingData);

  // Save back to localStorage
  localStorage.setItem("ngwangwa_bookings", JSON.stringify(bookings));

  console.log(`✅ Booking ${bookingData.reference} saved to localStorage`);
}

/**
 * Generate success message HTML from booking data object
 */
function generateSuccessHTML(bookingData) {
  return `
        <div class="success-message" id="successMessage">
            <div class="success-icon">✓</div>
            <h3 class="success-title">Quote Request Received!</h3>
            <p class="success-text">
                Daalụ (Thank you), <strong>${bookingData.customer.name}</strong>! 
                We've received your delivery request.
            </p>
            
            <div class="booking-reference">
                <span class="reference-label">Your Booking Reference:</span>
                <span class="reference-number">${bookingData.reference}</span>
                <p class="reference-help">
                    Please save this reference. You'll need it to track or confirm your delivery.
                </p>
            </div>
            
            ${generateBookingSummaryHTML(bookingData)}
            ${generateNextStepsHTML(bookingData)}
            
            <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                <a href="my-bookings.html" class="btn btn-secondary" style="flex: 1; text-decoration: none; display: flex; align-items: center; justify-content: center;">
                    View My Bookings
                </a>
                <button type="button" class="btn btn-primary" id="newQuoteBtn" style="flex: 1;">
                    Request Another Quote
                </button>
            </div>
        </div>
    `;
}

/**
 * Generate booking summary section HTML
 */
function generateBookingSummaryHTML(bookingData) {
  // Generate pricing HTML if available
  const pricingHTML =
    bookingData.pricing && typeof generatePriceEstimateHTML === "function"
      ? generatePriceEstimateHTML(bookingData.pricing)
      : "";

  return `
        <div class="booking-summary">
            <h4>Your Booking Details:</h4>
            <div class="summary-item">
                <span class="summary-label">From:</span>
                <span class="summary-value">${bookingData.pickup.location}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Pickup Method:</span>
                <span class="summary-value">${bookingData.pickup.methodLabel}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">To:</span>
                <span class="summary-value">${bookingData.delivery.location}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Item:</span>
                <span class="summary-value">${bookingData.item.typeLabel}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Weight:</span>
                <span class="summary-value">${bookingData.item.weightLabel}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Speed:</span>
                <span class="summary-value">${bookingData.delivery.speedLabel}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Contact:</span>
                <span class="summary-value">${bookingData.customer.phone}</span>
            </div>
            ${
              bookingData.item.specialInstructions
                ? `
            <div class="summary-item">
                <span class="summary-label">Instructions:</span>
                <span class="summary-value">${bookingData.item.specialInstructions}</span>
            </div>
            `
                : ""
            }
        </div>
        
        ${pricingHTML}
    `;
}

/**
 * Generate next steps section HTML
 */
function generateNextStepsHTML(bookingData) {
  return `
        <div class="next-steps">
            <h4>What Happens Next?</h4>
            <ol class="steps-list">
                <li>Our team will review your request and call you within 2-4 hours</li>
                <li>We'll confirm pricing and discuss pickup/drop-off options</li>
                <li>You can drop off at our hub or arrange rider pickup (based on availability)</li>
                <li>We'll update you once your item is with our delivery partner</li>
                <li>Track your shipment anytime using your reference: <a href="tracking.html" style="color: var(--color-primary); font-weight: 600;">Track Now →</a></li>
            </ol>
        </div>
    `;
}

/**
 * Reset form to initial state for a new quote request
 */
function resetForm() {
  // Remove success message
  const successMessage = document.getElementById("successMessage");
  if (successMessage) {
    successMessage.remove();
  }

  // Show form and progress indicator again
  const quoteForm = document.getElementById("quoteForm");
  const progressIndicator = document.querySelector(".progress-indicator");

  if (quoteForm) {
    quoteForm.style.display = "block";
    quoteForm.reset(); // Clear all form fields
  }

  if (progressIndicator) {
    progressIndicator.style.display = "flex";
  }

  // Clear any error messages
  clearAllErrors();

  // Reset to step 1
  goToStep(1);

  // Scroll back to form
  const quoteSection = document.getElementById("quoteSection");
  if (quoteSection) {
    quoteSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  console.log("Form reset - ready for new quote request");
}
