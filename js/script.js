let projects = [];

// Load data dari local storage saat halaman pertama kali dibuka
function loadFromStorage() {
  const saved = localStorage.getItem("projects");
  if (saved) {
    projects = JSON.parse(saved);
    renderProjects();
  }
}

// Simpan data ke local storage
function saveToStorage() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

// Render projects ke halaman
function renderProjects() {
  let html = "";
  for (let i = 0; i < projects.length; i++) {
    let p = projects[i];
    let badges = "";
    for (let j = 0; j < p.technologies.length; j++) {
      badges += `<span class="tech-badge">${p.technologies[j]}</span>`;
    }

    html += `
            <div class="col">
              <div class="project-card">
                <div class="project-image">${p.name[0].toUpperCase()}</div>
                <div class="p-3">
                  <div class="project-title">${p.name}</div>
                  <div class="project-duration">${p.startDate} - ${p.endDate}</div>
                  <div class="project-description">${p.description}</div>
                  <div class="mb-3">${badges}</div>
                  <div class="d-flex gap-2 mb-3 pb-3 border-bottom">
                    <div class="icon-btn">🔗</div>
                    <div class="icon-btn">⚡</div>
                    <div class="icon-btn">⋮</div>
                  </div>
                  <a href="detail.html?id=${p.id}" class="btn btn-dark btn-sm w-100">View Detail</a>
                </div>
              </div>
            </div>
          `;
  }

  document.getElementById("projectsGrid").innerHTML = html;
}

// Handle form submit
document.getElementById("projectForm").onsubmit = function (e) {
  e.preventDefault();

  // Ambil technologies yang dicheck
  let techs = [];
  document.querySelectorAll(".tech-check:checked").forEach(function (cb) {
    techs.push(cb.value);
  });

  // Cari ID terbesar yang ada, terus tambah 1
  let newId = 1;
  if (projects.length > 0) {
    let maxId = 0;
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].id > maxId) {
        maxId = projects[i].id;
      }
    }
    newId = maxId + 1;
  }

  // Tambah project ke array dengan ID auto increment
  projects.push({
    id: newId,
    name: document.getElementById("projectName").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    description: document.getElementById("description").value,
    technologies: techs,
  });

  // Simpan ke local storage
  saveToStorage();

  // Render ulang
  renderProjects();

  // Reset form
  this.reset();
};

// Load data saat halaman pertama kali dibuka
loadFromStorage();
