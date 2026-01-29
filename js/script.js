let projects = [];

document.getElementById("projectForm").onsubmit = function (e) {
  e.preventDefault();

  // Ambil technologies yang dicheck
  let techs = [];
  document.querySelectorAll(".tech-check:checked").forEach(function (cb) {
    techs.push(cb.value);
  });

  // Tambah project ke array
  projects.push({
    name: document.getElementById("projectName").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    description: document.getElementById("description").value,
    technologies: techs,
  });

  // Render
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
                  <div class="d-flex gap-2">
                    <div class="icon-btn">🔗</div>
                    <div class="icon-btn">⚡</div>
                    <div class="icon-btn">⋮</div>
                  </div>
                </div>
              </div>
            </div>
          `;
  }

  document.getElementById("projectsGrid").innerHTML = html;
  this.reset();
};
