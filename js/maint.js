// Current date
const currentDate = new Date();

// Maintenance end date
const maintenanceDate = new Date("02/06/24 9:00 AM MST");

// Check if the current date is before the maintenance end date
const isMaintenancePeriod = currentDate <= maintenanceDate;

// Check if the current page is 'beback.html'
const isOnMaintenancePage = window.location.pathname.endsWith("beback.html");

console.log("Is Maintenance Period:", isMaintenancePeriod);
console.log("Is On Maintenance Page:", isOnMaintenancePage);

// Check if maintenanceBypass session storage item is set
const bypassMaintenance = sessionStorage.getItem('maintenanceBypass') === 'true';

if (!bypassMaintenance && isMaintenancePeriod) {
    if (!isOnMaintenancePage) {
        console.log("Redirecting to beback.html");
        location.href = "beback.html"; // Redirect to Maintenance page
    }
} else if (!isMaintenancePeriod) {
    if (!window.location.pathname.endsWith("index.html")) {
        console.log("Redirecting to index.html");
        location.href = "index.html"; // Redirect to Main page
    }
}