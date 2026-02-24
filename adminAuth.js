// NgwaNgwa Delivery - Admin Authentication
// Simple password protection for MVP

console.log("🔐 Admin Authentication loaded");

// ===========================
// PASSWORD CONFIGURATION
// ===========================

// IMPORTANT: Change this password for production!
const ADMIN_PASSWORD = "ngwangwa2026";

// Session key for localStorage
const SESSION_KEY = "ngwangwa_admin_session";

/**
 * Check if user is already authenticated
 * Uses localStorage to remember login during browser session
 */
function isAuthenticated() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;

  // Check if session is still valid (expires after 24 hours)
  const sessionData = JSON.parse(session);
  const now = new Date().getTime();
  const sessionAge = now - sessionData.timestamp;
  const twentyFourHours = 24 * 60 * 60 * 1000; // in milliseconds

  if (sessionAge > twentyFourHours) {
    // Session expired
    localStorage.removeItem(SESSION_KEY);
    return false;
  }

  return true;
}

/**
 * Create authenticated session
 */
function createSession() {
  const sessionData = {
    authenticated: true,
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  console.log("✅ Admin session created");
}

/**
 * Destroy authenticated session (logout)
 */
function destroySession() {
  localStorage.removeItem(SESSION_KEY);
  console.log("🚪 Admin session destroyed");
}

/**
 * Prompt user for password
 */
function promptForPassword() {
  const enteredPassword = prompt(
    "🔐 Admin Access Required\n\nPlease enter the admin password:",
  );

  // User cancelled the prompt
  if (enteredPassword === null) {
    alert("Access denied. Redirecting to homepage...");
    window.location.href = "index.html";
    return false;
  }

  // Check password
  if (enteredPassword === ADMIN_PASSWORD) {
    createSession();
    return true;
  } else {
    alert("❌ Incorrect password. Access denied.");
    window.location.href = "index.html";
    return false;
  }
}

/**
 * Handle logout button click
 */
function handleLogout() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    destroySession();
    alert("You have been logged out.");
    window.location.href = "index.html";
  }
}

/**
 * Initialize authentication check when page loads
 */
(function initAuth() {
  console.log("Checking admin authentication...");

  // Check if already authenticated
  if (isAuthenticated()) {
    console.log("✅ User already authenticated");
    return;
  }

  // Not authenticated, prompt for password
  console.log("❌ Not authenticated, prompting for password...");
  promptForPassword();
})();

/**
 * Set up logout button when DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});
