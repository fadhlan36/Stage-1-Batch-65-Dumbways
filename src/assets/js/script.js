// ========================================
// 📦 DATA STORAGE
// ========================================
let allProjects = [];
let displayedProjects = [];
let isEditing = false;
let editingId = null;

// ========================================
// 💾 LOCAL STORAGE
// ========================================
const loadProjects = () => {
  const savedData = localStorage.getItem("projects");

  if (savedData) {
    allProjects = JSON.parse(savedData);
    displayedProjects = [...allProjects];
  }

  renderProjects();
};

const saveProjects = () => {
  localStorage.setItem("projects", JSON.stringify(allProjects));
};

// ========================================
// 🎨 TAMPILAN
// ========================================
const createTechBadges = (technologies = []) => {
  return technologies
    .map((tech) => `<span class="tech-badge">${tech}</span>`)
    .join("");
};

const createProjectCard = (project) => {
  const firstLetter = project.name?.[0]?.toUpperCase() || "?";
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
          
          <a href="/project-detail/${project.id}" class="btn btn-dark btn-sm w-100 mb-2">
            View Detail
          </a>

          <button onclick="editProject(${project.id})" class="btn btn-warning btn-sm w-100 mb-2">
            Edit
          </button>

          <button onclick="deleteProject(${project.id})" class="btn btn-danger btn-sm w-100">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
};

const showEmptyState = () => {
  return `
    <div class="col-12 text-center py-5">
      <h3>No Projects Found</h3>
      <p>Belum ada project.</p>
    </div>
  `;
};

const renderProjects = () => {
  const projectGrid = document.getElementById("projectsGrid");
  if (!projectGrid) return;

  if (displayedProjects.length === 0) {
    projectGrid.innerHTML = showEmptyState();
    return;
  }

  projectGrid.innerHTML = displayedProjects.map(createProjectCard).join("");
};

// ========================================
// 🗑 DELETE
// ========================================
const deleteProject = (id) => {
  allProjects = allProjects.filter((p) => p.id !== id);
  displayedProjects = [...allProjects];

  saveProjects();
  renderProjects();
};

// ========================================
// ✏️ EDIT
// ========================================
const editProject = (id) => {
  const project = allProjects.find((p) => p.id === id);
  if (!project) return;

  isEditing = true;
  editingId = id;

  document.getElementById("projectName").value = project.name;
  document.getElementById("startDate").value = project.startDate;
  document.getElementById("endDate").value = project.endDate;
  document.getElementById("description").value = project.description;

  // checkbox tech
  document.querySelectorAll(".tech-check").forEach((cb) => {
    cb.checked = project.technologies.includes(cb.value);
  });

  window.scrollTo(0, 0);
};

// ========================================
// 🔍 FILTER
// ========================================
const filterProjects = (selectedTech) => {
  if (selectedTech === "all") {
    displayedProjects = [...allProjects];
  } else {
    displayedProjects = allProjects.filter((project) =>
      project.technologies.includes(selectedTech),
    );
  }

  renderProjects();
};

// ========================================
// 📝 FORM
// ========================================
const getSelectedTechnologies = () => {
  return Array.from(document.querySelectorAll(".tech-check:checked")).map(
    (cb) => cb.value,
  );
};

const generateNewId = () => {
  if (allProjects.length === 0) return 1;
  return Math.max(...allProjects.map((p) => p.id)) + 1;
};

const getFormData = () => {
  return {
    id: generateNewId(),
    name: document.getElementById("projectName").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    description: document.getElementById("description").value,
    technologies: getSelectedTechnologies(),
  };
};

const handleFormSubmit = (event) => {
  event.preventDefault();

  if (isEditing) {
    // UPDATE
    allProjects = allProjects.map((p) => {
      if (p.id === editingId) {
        return {
          ...p,
          name: projectName.value,
          startDate: startDate.value,
          endDate: endDate.value,
          description: description.value,
          technologies: getSelectedTechnologies(),
        };
      }
      return p;
    });

    isEditing = false;
    editingId = null;
  } else {
    // CREATE
    const newProject = getFormData();
    allProjects.push(newProject);
  }

  saveProjects();
  displayedProjects = [...allProjects];
  renderProjects();
  event.target.reset();
};

// ========================================
// 🚀 INIT
// ========================================
document.getElementById("projectForm").onsubmit = handleFormSubmit;
loadProjects();
