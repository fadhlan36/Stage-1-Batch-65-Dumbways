import express from "express";
import { Pool } from "pg";
import hbs from "hbs";

const app = express();
const port = 3000;

// ========================================
// DATABASE
// ========================================
const db = new Pool({
  user: "postgres",
  password: "pstff36",
  host: "localhost",
  port: 5432,
  database: "personal-web",
  max: 20,
});

db.connect();

// ========================================
// VIEW ENGINE
// ========================================
app.set("view engine", "hbs");
app.set("views", "src/views");

// HELPER HBS
hbs.registerHelper("includes", function (array, value) {
  if (!array) return false;
  return array.map(Number).includes(Number(value)); // Ngubah data string jadi angka
});

hbs.registerHelper("formatDate", function (date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
});

// ========================================
// MIDDLEWARE
// ========================================
app.use("/assets", express.static("src/assets"));
app.use(express.urlencoded({ extended: false }));

// ========================================
// ROUTES
// ========================================
app.get("/", (req, res) => {
  res.render("index");
});

// ========================================
// GET PROJECT
// ========================================
app.get("/project", async (req, res) => {
  try {
    const techQuery = `SELECT * FROM technologies`;
    const techResult = await db.query(techQuery);

    const projectQuery = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.start_date,
        p.end_date,
        ARRAY_AGG(t.id) AS technologies,
        ARRAY_AGG(t.tech_name) AS tech_names
      FROM projects p
      LEFT JOIN project_technologies pt ON p.id = pt.project_id
      LEFT JOIN technologies t ON pt.technology_id = t.id
      GROUP BY p.id
      ORDER BY p.id DESC
    `;

    const projectResult = await db.query(projectQuery);

    // 🔽 Addition
    const projects = projectResult.rows.map((project) => {
      return {
        ...project,
        technologies: project.tech_names, // change from numbers to techname
      };
    });

    res.render("project", {
      technologies: techResult.rows,
      projects: projects,
    });
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// CREATE PROJECT
// ========================================
app.post("/project", async (req, res) => {
  try {
    const { title, startDate, endDate, description, technologies } = req.body;

    const insertProject = `
      INSERT INTO projects (title, description, start_date, end_date, user_id)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id
    `;

    const result = await db.query(insertProject, [
      title,
      description,
      startDate,
      endDate,
      1,
    ]);

    const projectId = result.rows[0].id;

    if (technologies) {
      const techArray = Array.isArray(technologies)
        ? technologies
        : [technologies];

      for (let techId of techArray) {
        await db.query(
          `INSERT INTO project_technologies (project_id, technology_id)
           VALUES ($1,$2)`,
          [projectId, techId],
        );
      }
    }

    res.redirect("/project");
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// DELETE PROJECT
// ========================================
app.get("/delete-project/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM project_technologies WHERE project_id=$1", [
      id,
    ]);

    await db.query("DELETE FROM projects WHERE id=$1", [id]);

    res.redirect("/project");
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// EDIT PAGE
// ========================================
app.get("/edit-project/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // ambil semua technology dari db dan tampilkan tulisannya
    const techResult = await db.query(`SELECT * FROM technologies`);

    // ambil project + tech yg sudah dipilih
    const projectResult = await db.query(
      `
      SELECT 
        p.*,
        ARRAY_AGG(pt.technology_id) AS technologies
      FROM projects p
      LEFT JOIN project_technologies pt ON p.id = pt.project_id
      WHERE p.id=$1
      GROUP BY p.id
      `,
      [id],
    );

    const project = projectResult.rows[0];

    // biar tidak null
    const selectedTech = project.technologies || [];

    res.render("edit-project", {
      project: project,
      technologies: techResult.rows,
      selectedTech: selectedTech,
    });
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// UPDATE PROJECT
// ========================================
app.post("/edit-project/:id", async (req, res) => {
  const { id } = req.params;
  const { title, startDate, endDate, description, technologies } = req.body;

  try {
    await db.query(
      `
      UPDATE projects 
      SET title=$1, description=$2, start_date=$3, end_date=$4
      WHERE id=$5
      `,
      [title, description, startDate, endDate, id],
    );

    await db.query("DELETE FROM project_technologies WHERE project_id=$1", [
      id,
    ]);

    if (technologies) {
      const techArray = Array.isArray(technologies)
        ? technologies
        : [technologies];

      for (let techId of techArray) {
        await db.query(
          `INSERT INTO project_technologies (project_id, technology_id)
           VALUES ($1,$2)`,
          [id, techId],
        );
      }
    }

    res.redirect("/project");
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// DETAIL PROJECT
// ========================================
app.get("/project-detail/:id", (req, res) => {
  res.render("project-detail");
});

// ========================================
// CONTACT
// ========================================
app.get("/contact", (req, res) => {
  res.render("contact");
});

// ========================================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
