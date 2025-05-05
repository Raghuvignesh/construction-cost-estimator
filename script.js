document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const projectName = params.get("name") || "Untitled";
    const projectKey = `project_${projectName}`;
    const addMaterialBtn = document.getElementById("add-material");
    const saveBtn = document.getElementById("saveProjectBtn");
    const exitBtn = document.getElementById("exitProjectBtn");
    const downloadBtn = document.getElementById("download-pdf");
    const materialSelect = document.getElementById("material");
    const newMaterialInput = document.getElementById("new-material");
    const quantityInput = document.getElementById("quantity");
    const unitSelect = document.getElementById("unit");
    const unitPriceInput = document.getElementById("unit-price");
    const materialList = document.getElementById("material-list");
    const totalCostBar = document.getElementById("total-cost");
    const emptyMsg = document.getElementById("empty-msg");
    const customMaterialsKey = `custom_materials_${projectName}`;
    const defaultMaterials = ["Cement", "Sand", "Steel", "Bricks"];
    let customMaterials = JSON.parse(localStorage.getItem(customMaterialsKey)) || [];

  
    let materials = [];
    const defaultUnits = [
        "kg", "g", "ton", "litre", "ml", "m³", "cm³", "ft³", "m",
        "cm", "mm", "ft", "inch", "bag", "nos", "pcs", "set", "roll", "sheet"
      ];
      
      function getUnitUsage() {
        return JSON.parse(localStorage.getItem("unitUsage")) || {};
      }
      
      function saveUnitUsage(usage) {
        localStorage.setItem("unitUsage", JSON.stringify(usage));
      }
      
      function getSortedUnits() {
        const usage = getUnitUsage();
        return [...defaultUnits].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));
      }
      
      function renderUnitOptions(selectedUnit = "") {
        const sortedUnits = getSortedUnits();
        unitSelect.innerHTML = "";
        sortedUnits.forEach(unit => {
          const option = document.createElement("option");
          option.value = unit;
          option.textContent = unit;
          if (unit === selectedUnit) option.selected = true;
          unitSelect.appendChild(option);
        });
      }
      
      // Initial render
      renderUnitOptions();
      
  
    // Load materials from localStorage
    function loadMaterials() {
      const data = localStorage.getItem(projectKey);
      materials = data ? JSON.parse(data) : [];
      renderMaterials();
    }
    function populateMaterialDropdown() {
        materialSelect.innerHTML = "";
      
        [...defaultMaterials, ...customMaterials].forEach(material => {
          const option = document.createElement("option");
          option.value = material;
          option.textContent = material;
          materialSelect.appendChild(option);
        });
      
        // Add "Other" option
        const otherOption = document.createElement("option");
        otherOption.value = "Other";
        otherOption.textContent = "Other (Add New)";
        materialSelect.appendChild(otherOption);
      }
      
      populateMaterialDropdown();

  
    // Save materials to localStorage
    function saveMaterials() {
      localStorage.setItem(projectKey, JSON.stringify(materials));
      alert("Project saved!");
    }
    
  
    // Render table rows
    function renderMaterials() {
      materialList.innerHTML = "";
      let total = 0;
  
      if (materials.length === 0) {
        emptyMsg.style.display = "block";
      } else {
        emptyMsg.style.display = "none";
      }
  
      materials.forEach((mat, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${mat.name}</td>
          <td>${mat.quantity}</td>
          <td>${mat.unit}</td>
          <td>₹${mat.unitPrice}</td>
          <td>₹${(mat.quantity * mat.unitPrice).toFixed(2)}</td>
          <td><button onclick="deleteMaterial(${index})">❌</button></td>
        `;
        materialList.appendChild(row);
        total += mat.quantity * mat.unitPrice;
      });
  
      totalCostBar.textContent = `Total: ₹${total.toFixed(2)}`;
    }
  
    // Delete material
    window.deleteMaterial = function(index) {
      materials.splice(index, 1);
      renderMaterials();
    };
  
    // Add material button
    addMaterialBtn.addEventListener("click", () => {
      let material = materialSelect.value;

if (material === "Other") {
  material = newMaterialInput.value.trim();
  if (!material) {
    alert("Please enter a new material name.");
    return;
  }

  // Save new material to localStorage if it's not already saved
  if (!customMaterials.includes(material)) {
    customMaterials.push(material);
    localStorage.setItem(customMaterialsKey, JSON.stringify(customMaterials));
    populateMaterialDropdown();
    materialSelect.value = material; // auto-select the newly added one
  }
}
      const quantity = parseFloat(quantityInput.value);
      const unit = unitSelect.value;
      const usage = getUnitUsage();
usage[unit] = (usage[unit] || 0) + 1;
saveUnitUsage(usage);
renderUnitOptions(unit); // Re-render and keep selected unit

      const unitPrice = parseFloat(unitPriceInput.value);
  
      if (!material || isNaN(quantity) || isNaN(unitPrice)) {
        alert("Please fill in all fields correctly.");
        return;
      }
  
      materials.push({ name: material, quantity, unit, unitPrice });
      quantityInput.value = "";
      unitPriceInput.value = "";
      newMaterialInput.value = "";
      newMaterialInput.style.display = "none";
      materialSelect.value = "Cement";
      renderMaterials();
    });
  
    // Show/hide new material input
    materialSelect.addEventListener("change", () => {
      if (materialSelect.value === "Other") {
        newMaterialInput.style.display = "block";
      } else {
        newMaterialInput.style.display = "none";
      }
    });
  
    // Save button
    saveBtn.addEventListener("click", () => {
      saveMaterials();
    });
  
    // Exit button
    exitBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  
    // Download PDF
    downloadBtn.addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(`${projectName} - Material Cost Summary`, 10, 10);
      doc.autoTable({
        head: [["Material", "Qty", "Unit", "Price", "Total"]],
        body: materials.map(mat => [
          mat.name,
          mat.quantity,
          mat.unit,
          `₹${mat.unitPrice}`,
          `₹${(mat.quantity * mat.unitPrice).toFixed(2)}`
        ])
      });
      doc.save(`${projectName}_summary.pdf`);
    });
  
    loadMaterials();
  });
  