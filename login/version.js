// Define the version of the script you want to load
const VERSION_NUMBER = "1.0.0";

// Key to store in SessionStorage
const SESSION_STORAGE_KEY = `winners-${VERSION_NUMBER}`;

async function loadScriptWithVersion() {
    let scriptContent = sessionStorage.getItem(SESSION_STORAGE_KEY);

    // If the script content does not exist in SessionStorage or the version has changed
    if (!scriptContent) {
        try {
            const response = await fetch('../login/winners.js');
            if (!response.ok) {
                throw new Error("Failed to fetch winners.js");
            }
            scriptContent = await response.text();
            sessionStorage.setItem(SESSION_STORAGE_KEY, scriptContent);
        } catch (error) {
            console.error("Error in fetching script:", error);
            return;
        }
    }

    // Load the script dynamically
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.text = scriptContent; // Use .text since it's inline script
    document.head.appendChild(scriptElement);
}

// Initial script loading
loadScriptWithVersion();