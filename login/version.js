 // Define a function to replace the version placeholder
 function updateScriptVersion() {
     const versionNumber = '1.0.0'; // Replace with the actual version number
     const scriptElement = document.getElementById('dynamic-script');
     scriptElement.src = scriptElement.src.replace('{{version}}', versionNumber);
 }

 // Call the function to update the script source
 updateScriptVersion();