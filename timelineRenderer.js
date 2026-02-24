// NgwaNgwa Delivery - Timeline Renderer
// Renders delivery timeline visualization

console.log("📅 Timeline Renderer initialized!");

/**
 * Render delivery timeline
 * @param {Object} booking - The booking object
 * @returns {string} - HTML string for timeline
 */
function renderTimeline(booking) {
  if (!booking.timeline || booking.timeline.length === 0) {
    return `
            <div class="timeline-container">
                <h3 class="timeline-heading">📅 Delivery Timeline</h3>
                <p class="timeline-empty">No timeline information available.</p>
            </div>
        `;
  }

  // All possible stages in order
  const allStages = [
    "Booked",
    "Awaiting Pickup",
    "Picked Up",
    "In Transit",
    "Delivered",
  ];

  // Get completed stages from booking timeline
  const completedStages = booking.timeline.map((entry) => entry.stage);
  const currentStage = booking.status;

  // Build timeline HTML
  const timelineItems = allStages
    .map((stage, index) => {
      const isCompleted = completedStages.includes(stage);
      const isCurrent = stage === currentStage;
      const timelineEntry = booking.timeline.find(
        (entry) => entry.stage === stage,
      );

      return generateTimelineItem(
        stage,
        isCompleted,
        isCurrent,
        timelineEntry,
        index,
      );
    })
    .join("");

  return `
        <div class="timeline-container">
            <h3 class="timeline-heading">📅 Delivery Timeline</h3>
            <div class="timeline">
                ${timelineItems}
            </div>
        </div>
    `;
}

/**
 * Generate individual timeline item
 */
function generateTimelineItem(
  stage,
  isCompleted,
  isCurrent,
  timelineEntry,
  index,
) {
  const statusClass = isCompleted
    ? "completed"
    : isCurrent
      ? "current"
      : "pending";

  const icon = getStageIcon(stage, isCompleted);
  const timestamp = timelineEntry
    ? formatTimelineTimestamp(timelineEntry.timestamp)
    : "";

  return `
        <div class="timeline-item timeline-item-${statusClass}">
            <div class="timeline-marker">
                <span class="timeline-icon">${icon}</span>
            </div>
            <div class="timeline-content">
                <h4 class="timeline-stage">${stage}</h4>
                ${timestamp ? `<p class="timeline-time">${timestamp}</p>` : ""}
                <p class="timeline-description">${getStageDescription(stage)}</p>
            </div>
        </div>
    `;
}

/**
 * Get icon for stage
 */
function getStageIcon(stage, isCompleted) {
  if (isCompleted) {
    return "✓";
  }

  const icons = {
    Booked: "📋",
    "Awaiting Pickup": "⏳",
    "Picked Up": "📦",
    "In Transit": "🚚",
    Delivered: "🎉",
  };

  return icons[stage] || "○";
}

/**
 * Get description for stage
 */
function getStageDescription(stage) {
  const descriptions = {
    Booked: "Your booking has been confirmed in our system",
    "Awaiting Pickup": "Waiting for item collection or drop-off at hub",
    "Picked Up": "Item collected and ready for dispatch",
    "In Transit": "On the way to destination with delivery partner",
    Delivered: "Successfully delivered to recipient",
  };

  return descriptions[stage] || "";
}

/**
 * Format timestamp for timeline display
 */
function formatTimelineTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();

  // Calculate difference in milliseconds
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Show relative time for recent updates
  if (diffMins < 60) {
    return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
  }

  // Show full date for older updates
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-NG", options);
}

/**
 * Get progress percentage based on current status
 */
function getProgressPercentage(status) {
  const statusProgress = {
    Booked: 20,
    "Awaiting Pickup": 40,
    "Picked Up": 60,
    "In Transit": 80,
    Delivered: 100,
  };

  return statusProgress[status] || 0;
}

// Make functions available globally
window.renderTimeline = renderTimeline;
window.getProgressPercentage = getProgressPercentage;
