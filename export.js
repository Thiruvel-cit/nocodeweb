// export.js

// Function to build a full HTML document from the current canvas design.
function exportCanvasToHTML() {
    // Get the innerHTML of the canvas (the design).
    const canvasContent = document.getElementById("canvas").innerHTML;
    
    // Build a complete HTML document string.
    const fullHTML = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Exported Website</title>
      <style>
        /* Global styles for the exported webpage */
        body { margin: 0; padding: 0; }
        #canvas { position: relative; width: 100%; min-height: 100vh; }
        /* (Include any component-specific CSS here, if needed.) */
      </style>
    </head>
    <body>
      <div id="canvas">
        ${canvasContent}
      </div>
    </body>
  </html>
    `;
    return fullHTML;
  }
  
  // Function to preview the exported website in a new window/tab.
  function previewExportedWebsite() {
    // Option A (Using sessionStorage):
    // Save the canvas content in sessionStorage so the preview page can load it.
    const canvasContent = document.getElementById("canvas").innerHTML;
    sessionStorage.setItem("exportedCanvas", canvasContent);
    window.open("export.html", "_blank");
  
    // Option B (Directly open new window with exported HTML):
    // const exportedHTML = exportCanvasToHTML();
    // const previewWindow = window.open("", "_blank");
    // previewWindow.document.open();
    // previewWindow.document.write(exportedHTML);
    // previewWindow.document.close();
  }
  
  // Function to download the exported website as an HTML file.
  function downloadExportedWebsite() {
    const exportedHTML = exportCanvasToHTML();
    const blob = new Blob([exportedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  