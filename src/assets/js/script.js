// ========================================
// 📦 DATA STORAGE (Penyimpanan Data)
// ========================================
let allProjects = [];
let displayedProjects = [];

// ========================================
// 💾 LOCAL STORAGE (Simpan & Load Data)
// ========================================

// Ambil data dari localStorage saat halaman dibuka
const loadProjects = () => {
  const savedData = localStorage.getItem("projects");

  if (savedData) {
    allProjects = JSON.parse(savedData);
    displayedProjects = allProjects;
    renderProjects();
  }
};

// Simpan data ke localStorage
const saveProjects = () => {
  localStorage.setItem("projects", JSON.stringify(allProjects));
};

// ========================================
// 🎨 TAMPILAN (Render Functions)
// ========================================

// Buat badge teknologi (React, Node.js, dll)
const createTechBadges = (technologies) => {
  const badges = technologies.map((tech) => {
    //callback
    return `<span class="tech-badge">${tech}</span>`;
  });

  return badges.join("");
};

// Buat satu card project
const createProjectCard = (project) => {
  // Ambil huruf pertama untuk avatar
  const firstLetter = project.name[0].toUpperCase();

  // Buat badges teknologi
  const techBadges = createTechBadges(project.technologies);

  return `
    <div class="col">
      <div class="project-card">
        <div class="project-image">${firstLetter}</div>
        <div class="p-3">
          <div class="project-title">${project.name}</div>
          <div class="project-duration">${project.startDate} - ${project.endDate}</div>
          <div class="project-description">${project.description}</div>
          <div class="mb-3">${techBadges}</div> 
          <a href="/project-detail/${project.id}" class="btn btn-dark btn-sm w-100">
            View Detail
          </a>
        </div>
      </div>
    </div>
  `;
};

// Tampilkan pesan kosong jika tidak ada project
const showEmptyState = () => {
  return `
    <div class="col-12 text-center py-5">
      <h3>No Projects Found</h3>
      <p>Belum ada project yang sesuai dengan filter.</p>
    </div>
  `;
};

// Render semua project ke halaman
const renderProjects = () => {
  const projectGrid = document.getElementById("projectsGrid");

  // Jika tidak ada project, tampilkan pesan kosong
  if (displayedProjects.length === 0) {
    projectGrid.innerHTML = showEmptyState();
    return;
  }

  // Buat semua card project
  const allCards = displayedProjects.map(createProjectCard);

  // Gabungkan semua card dan tampilkan
  projectGrid.innerHTML = allCards.join("");
};

// ========================================
// 🔍 FILTER (Saring Project)
// ========================================

const filterProjects = (selectedTech) => {
  // Jika "all", tampilkan semua project
  if (selectedTech === "all") {
    displayedProjects = allProjects;
  }
  // Jika pilih teknologi tertentu, filter yang cocok
  else {
    displayedProjects = allProjects.filter((project) => {
      return project.technologies.includes(selectedTech);
    });
  }

  // Tampilkan hasil filter
  renderProjects();
};

// ========================================
// 📝 FORM (Tambah Project Baru)
// ========================================

// Ambil teknologi yang dipilih dari checkbox
const getSelectedTechnologies = () => {
  const checkedBoxes = document.querySelectorAll(".tech-check:checked");

  const selectedTechs = Array.from(checkedBoxes).map((checkbox) => {
    return checkbox.value;
  });

  return selectedTechs;
};

// Buat ID baru untuk project
const generateNewId = () => {
  // Jika belum ada project, mulai dari 1
  if (allProjects.length === 0) {
    return 1;
  }

  // Ambil semua ID yang ada
  const existingIds = allProjects.map((project) => project.id);

  // Cari ID terbesar, lalu tambah 1
  const highestId = Math.max(...existingIds);
  return highestId + 1;
};

// Ambil semua data dari form
const getFormData = () => {
  const projectData = {
    id: generateNewId(),
    name: document.getElementById("projectName").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    description: document.getElementById("description").value,
    technologies: getSelectedTechnologies(),
  };

  return projectData;
};

// Ketika form disubmit
const handleFormSubmit = (event) => {
  event.preventDefault(); // Jangan refresh halaman

  // Ambil data dari form
  const newProject = getFormData();

  // Tambahkan ke daftar project
  allProjects.push(newProject);

  // Simpan ke localStorage
  saveProjects();

  // Update tampilan
  displayedProjects = allProjects;
  renderProjects();

  // Kosongkan form
  event.target.reset();
};

// ========================================
// 🚀 JALANKAN SAAT HALAMAN DIBUKA
// ========================================

// Pasang event handler ke form
document.getElementById("projectForm").onsubmit = handleFormSubmit;

// Load data dari localStorage
loadProjects();
