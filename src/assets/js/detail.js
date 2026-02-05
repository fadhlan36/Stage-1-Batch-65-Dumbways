// Ambil ID dari URL halaman
const pathParts = window.location.pathname.split("/");
const projectId = pathParts[2];

// Function untuk hitung durasi
function calculateDuration(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
}

// Function untuk format tanggal
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

// Load data dari local storage
const saved = localStorage.getItem("projects");
if (saved) {
  const projects = JSON.parse(saved);

  // Cari project berdasarkan ID
  const project = projects.find(function (p) {
    return p.id == projectId;
  });

  if (project) {
    // Set title
    document.getElementById("projectTitle").textContent = project.name;

    // Set image (placeholder untuk sekarang)
    const img = document.getElementById("projectImage");
    img.style.background = "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)";
    img.style.display = "flex";
    img.style.alignItems = "center";
    img.style.justifyContent = "center";
    img.style.fontSize = "80px";
    img.style.color = "white";
    img.style.fontWeight = "bold";
    img.alt = project.name;
    img.removeAttribute("src");
    img.textContent = project.name[0].toUpperCase();

    // Set dates
    document.getElementById("projectDates").textContent =
      formatDate(project.startDate) + " - " + formatDate(project.endDate);

    // Set duration
    const duration = calculateDuration(project.startDate, project.endDate);
    document.getElementById("projectDuration").textContent = duration;

    // Set description
    document.getElementById("projectDescription").textContent =
      project.description;

    // Set technologies dengan icon
    let techHtml = "";
    for (let i = 0; i < project.technologies.length; i++) {
      const tech = project.technologies[i];
      let icon = "";

      // Tentukan icon berdasarkan nama teknologi
      if (tech.includes("React")) {
        icon = "⚛️";
      } else if (tech.includes("Node")) {
        icon = "JS";
      } else if (tech.includes("JavaScript")) {
        icon = "JS";
      } else if (tech.includes("Next")) {
        icon = "▲";
      } else if (tech.includes("TypeScript")) {
        icon = "TS";
      } else {
        icon = tech.substring(0, 2).toUpperCase();
      }

      techHtml += `
              <div class="tech-item">
                <div class="tech-icon">${icon}</div>
                <span>${tech}</span>
              </div>
            `;
    }
    document.getElementById("projectTechnologies").innerHTML = techHtml;
  } else {
    // Project tidak ditemukan
    document.querySelector(".detail-section").innerHTML = `
            <div class="container text-center py-5">
              <h1>Project Not Found</h1>
              <p>Project dengan ID ${projectId} tidak ditemukan.</p>
              <a href="project-portfolio-minimal.html" class="btn btn-dark">← Back to Projects</a>
            </div>
          `;
  }
} else {
  // Belum ada data
  document.querySelector(".detail-section").innerHTML = `
          <div class="container text-center py-5">
            <h1>No Data</h1>
            <p>Belum ada project yang tersimpan.</p>
            <a href="/project" class="btn btn-dark">← Back to Projects</a>
          </div>
        `;
}
