document.addEventListener("DOMContentLoaded", function () {
  // ===== Global Variables & Selection Functions =====
  let currentSelectedElement = null;

  function setSelectedElement(el) {
    if (currentSelectedElement && currentSelectedElement !== el) {
      currentSelectedElement.style.outline = "";
    }
    currentSelectedElement = el;
    currentSelectedElement.style.outline = "2px dashed blue"; // Visual selection indicator
  }

  function clearSelection() {
    if (currentSelectedElement) {
      currentSelectedElement.style.outline = "";
      currentSelectedElement = null;
    }
  }

  // ===== Tab Switching Logic =====
  document.getElementById("dashboard-tab").addEventListener("click", () => toggleSection("dashboard"));
  document.getElementById("my-projects-tab").addEventListener("click", () => toggleSection("my-projects"));
  document.getElementById("deploy-tab").addEventListener("click", () => toggleSection("deploy"));
  document.getElementById("settings-tab").addEventListener("click", () => toggleSection("settings"));

  function toggleSection(section) {
    document.getElementById("dashboard-section").style.display = "none";
    document.getElementById("my-projects-section").style.display = "none";
    document.getElementById("deploy-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
    document.getElementById(`${section}-section`).style.display = "block";
  }

  // ===== Canvas Drag-and-Drop =====
  const canvas = document.getElementById("canvas");

  // Helper function: Check if an element is completely outside canvas horizontally.
  function isElementOutsideCanvas(el) {
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return (elRect.right < canvasRect.left || elRect.left > canvasRect.right);
  }

  // Set up draggable components (button, text, shape, image, hyperlink)
  document.querySelectorAll(".draggable-component").forEach((component) => {
    component.addEventListener("dragstart", function (event) {
      const data = {
        type: event.target.getAttribute("data-type"),
        template: event.target.getAttribute("data-template")
      };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
      event.dataTransfer.effectAllowed = "copy";
    });
  });

  // Allow dropping on the canvas.
  canvas.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  // Handle drop events.
  canvas.addEventListener("drop", function (event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      console.error("Invalid drag data:", err);
      return;
    }
    const type = data.type;
    const template = data.template;
    let element;

    if (type === "button") {
      element = document.createElement("button");
      element.className = "canvas-button dropped-item";

      let labelSpan = document.createElement("span");
      labelSpan.textContent = ""; // Start empty for immediate typing.
      labelSpan.contentEditable = "true";
      labelSpan.style.outline = "none";
      labelSpan.style.display = "inline-block";
      labelSpan.style.width = "100%";
      labelSpan.style.height = "100%";
      labelSpan.style.color = "black";
      labelSpan.style.textAlign = "center";

      labelSpan.addEventListener("blur", function () {
        labelSpan.contentEditable = "false";
        if (labelSpan.textContent.trim() === "") {
          labelSpan.textContent = "Button";
        }
      });
      labelSpan.addEventListener("dblclick", function (e) {
        e.stopPropagation();
        labelSpan.contentEditable = "true";
        labelSpan.focus();
      });
      element.appendChild(labelSpan);
      setTimeout(() => { labelSpan.focus(); }, 0);
    } else if (type === "text") {
      element = document.createElement("p");
      element.className = "canvas-text dropped-item";
      element.contentEditable = "false"; // Move mode by default.
      element.style.background = "transparent";
      element.style.border = "none";
      element.style.minWidth = "100px";
      element.style.minHeight = "30px";
      element.style.whiteSpace = "normal";
      element.style.fontSize = "16px";
      element.innerText = "Double-click to edit text";
      element.addEventListener("dblclick", function () {
        element.contentEditable = "true";
        element.focus();
      });
      element.addEventListener("blur", function () {
        element.contentEditable = "false";
      });
    } else if (type === "hyperlink") {
      element = document.createElement("a");
      element.className = "canvas-hyperlink dropped-item";
      element.href = "#";
      element.innerText = "Double-click to edit link text";
      element.contentEditable = "false";
      element.style.background = "transparent";
      element.style.border = "none";
      element.style.minWidth = "100px";
      element.style.minHeight = "30px";
      element.style.whiteSpace = "normal";
      element.style.fontSize = "16px";
      element.addEventListener("dblclick", function () {
        element.contentEditable = "true";
        element.focus();
      });
      element.addEventListener("blur", function () {
        element.contentEditable = "false";
        let newUrl = prompt("Enter hyperlink URL:", element.href);
        if (newUrl) {
          element.href = newUrl;
        }
      });
    } else if (type === "shape") {
      element = document.createElement("div");
      element.className = `canvas-shape ${template} dropped-item`;
    } else if (type === "image") {
      // Create an image element.
      let imgElement = document.createElement("img");
      imgElement.className = "canvas-image";
      imgElement.src = "https://via.placeholder.com/100";
      imgElement.alt = "Dropped Image";
      imgElement.style.width = "100%";
      imgElement.style.height = "100%";

      // Wrap the image in a container.
      element = document.createElement("div");
      element.className = "image-container dropped-item";
      element.style.width = "100px";
      element.style.height = "100px";
      element.style.position = "absolute";

      element.appendChild(imgElement);
    } else if (type === "image-placeholder") {
      return; // Handled separately.
    }

    if (element) {
      element.style.position = "absolute";
      element.style.left = `${event.offsetX}px`;
      element.style.top = `${event.offsetY}px`;
      canvas.appendChild(element);
      makeDraggableAndResizable(element);
      element.addEventListener("click", function (e) {
        if (element.contentEditable !== "true") {
          setSelectedElement(element);
          e.stopPropagation();
        }
      });
    }
  });

  // Deselect element if clicking on canvas background.
  canvas.addEventListener("click", function (e) {
    if (e.target === canvas) {
      clearSelection();
    }
  });

  // ===== Image Placeholder & Upload =====
  let selectedPlaceholder = null;
  document.getElementById("imagePlaceholderButton").addEventListener("dragstart", function (event) {
    event.dataTransfer.setData("text/plain", JSON.stringify({ type: "image-placeholder" }));
  });

  canvas.addEventListener("drop", function (event) {
    event.preventDefault();
    let data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (data.type === "image-placeholder") {
      let placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.style.position = "absolute";
      placeholder.style.left = `${event.offsetX}px`;
      placeholder.style.top = `${event.offsetY}px`;
      placeholder.style.width = "150px";
      placeholder.style.height = "150px";
      placeholder.style.border = "2px dashed #007bff";
      placeholder.style.backgroundColor = "rgba(0,0,0,0.1)";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.innerText = "Drop Image Here";
      canvas.appendChild(placeholder);
      selectedPlaceholder = placeholder;
      document.getElementById("imageUploader").click();
    }
  });

  document.getElementById("imageUploader").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && selectedPlaceholder) {
      const reader = new FileReader();
      reader.onload = function (e) {
        let imgElement = document.createElement("img");
        imgElement.className = "canvas-image dropped-item";
        imgElement.src = e.target.result;
        imgElement.style.position = "absolute";
        imgElement.style.left = selectedPlaceholder.style.left;
        imgElement.style.top = selectedPlaceholder.style.top;
        imgElement.style.width = selectedPlaceholder.style.width;
        imgElement.style.height = selectedPlaceholder.style.height;
        canvas.replaceChild(imgElement, selectedPlaceholder);
        makeDraggableAndResizable(imgElement);
        selectedPlaceholder = null;
      };
      reader.readAsDataURL(file);
    }
  });

  // ===== Draggable & Resizable Functionality =====
  function makeDraggableAndResizable(element) {
    const resizeThreshold = 10; // Pixels from bottom-right to trigger resize

    element.addEventListener("mousemove", function (e) {
      const rect = element.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      if (localX >= rect.width - resizeThreshold && localY >= rect.height - resizeThreshold) {
        element.style.cursor = "nwse-resize";
      } else {
        element.style.cursor = element.contentEditable === "true" ? "text" : "move";
      }
    });

    element.addEventListener("mousedown", function (e) {
      const rect = element.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      // If element is in edit mode and in the resize zone, allow resizing.
      if (element.contentEditable === "true") {
        if (localX >= rect.width - resizeThreshold && localY >= rect.height - resizeThreshold) {
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = rect.width;
          const startHeight = rect.height;
          let startFontSize;
          if (element.classList.contains("canvas-text") || element.classList.contains("canvas-hyperlink")) {
            startFontSize = parseFloat(window.getComputedStyle(element).fontSize);
          }
          function resizeElement(event) {
            const newWidth = startWidth + (event.clientX - startX);
            const newHeight = startHeight + (event.clientY - startY);
            element.style.width = (newWidth > 20 ? newWidth : 20) + "px";
            element.style.height = (newHeight > 20 ? newHeight : 20) + "px";
            if (startFontSize) {
              const ratio = newWidth / startWidth;
              element.style.fontSize = (startFontSize * ratio) + "px";
            }
          }
          function stopResize() {
            document.removeEventListener("mousemove", resizeElement);
            document.removeEventListener("mouseup", stopResize);
          }
          document.addEventListener("mousemove", resizeElement);
          document.addEventListener("mouseup", stopResize);
        }
        return;
      }

      e.preventDefault();
      if (localX >= rect.width - resizeThreshold && localY >= rect.height - resizeThreshold) {
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        let startFontSize;
        if (element.classList.contains("canvas-text") || element.classList.contains("canvas-hyperlink")) {
          startFontSize = parseFloat(window.getComputedStyle(element).fontSize);
        }
        function resizeElement(event) {
          const newWidth = startWidth + (event.clientX - startX);
          const newHeight = startHeight + (event.clientY - startY);
          element.style.width = (newWidth > 20 ? newWidth : 20) + "px";
          element.style.height = (newHeight > 20 ? newHeight : 20) + "px";
          if (startFontSize) {
            const ratio = newWidth / startWidth;
            element.style.fontSize = (startFontSize * ratio) + "px";
          }
        }
        function stopResize() {
          document.removeEventListener("mousemove", resizeElement);
          document.removeEventListener("mouseup", stopResize);
        }
        document.addEventListener("mousemove", resizeElement);
        document.addEventListener("mouseup", stopResize);
      } else {
        const offsetX = e.clientX - element.offsetLeft;
        const offsetY = e.clientY - element.offsetTop;
        function moveElement(event) {
          element.style.left = (event.clientX - offsetX) + "px";
          element.style.top = (event.clientY - offsetY) + "px";
        }
        function stopMove() {
          document.removeEventListener("mousemove", moveElement);
          document.removeEventListener("mouseup", stopMove);
          // After moving, check if element is outside canvas horizontally.
          if (isElementOutsideCanvas(element)) {
            element.parentElement.removeChild(element);
            if (currentSelectedElement === element) {
              clearSelection();
            }
          }
        }
        document.addEventListener("mousemove", moveElement);
        document.addEventListener("mouseup", stopMove);
      }
    });
  }

  // ===== Dropdown Submenu Handling =====
  document.querySelectorAll(".dropdown-submenu > .dropdown-toggle").forEach(function (submenu) {
    submenu.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      let submenuDropdown = this.nextElementSibling;
      submenuDropdown.classList.toggle("show");
      let rect = submenuDropdown.getBoundingClientRect();
      let windowHeight = window.innerHeight;
      if (rect.bottom > windowHeight) {
        submenuDropdown.classList.add("auto-position");
      } else {
        submenuDropdown.classList.remove("auto-position");
      }
      document.addEventListener("click", function hideSubmenu(event) {
        if (!submenu.contains(event.target)) {
          submenuDropdown.classList.remove("show");
          document.removeEventListener("click", hideSubmenu);
        }
      });
    });
  });
});
