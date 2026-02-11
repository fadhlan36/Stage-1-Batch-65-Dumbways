import express from "express";
import { Pool } from "pg";
import hbs from "hbs";
import bcrypt from "bcrypt";
import flash from "express-flash";
import session from "express-session";
import multer from "multer";
import fs from "fs";

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

// ========================================
// HELPER HBS
// ========================================
hbs.registerHelper("includes", function (array, value) {
  if (!array) return false;
  return array.map(Number).includes(Number(value));
});

hbs.registerHelper("formatDate", function (date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
});

// ========================================
// MIDDLEWARE
// ========================================
app.use("/assets", express.static("src/assets"));
app.use("/uploads", express.static("src/assets/uploads"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(flash());

// ========================================
// AUTH MIDDLEWARE
// ========================================
function authMiddleware(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Kamu harus login dulu!");
    return res.redirect("/login");
  }
  next();
}

// ========================================
// MULTER CONFIG
// ========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/assets/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ========================================
// HOME
// ========================================
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

// ========================================
// GET PROJECT
// ========================================
app.get("/project", authMiddleware, async (req, res) => {
  let userData = req.session.user?.name || null;

  try {
    const techResult = await db.query(`SELECT * FROM technologies`);

    const projectResult = await db.query(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.start_date,
        p.end_date,
        p.image,
        ARRAY_AGG(t.tech_name) AS technologies
      FROM projects p
      LEFT JOIN project_technologies pt ON p.id = pt.project_id
      LEFT JOIN technologies t ON pt.technology_id = t.id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    res.render("project", {
      technologies: techResult.rows,
      projects: projectResult.rows,
      userData,
    });
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// CREATE PROJECT
// ========================================
app.post(
  "/project",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, startDate, endDate, description, technologies } = req.body;

      const image = req.file ? req.file.filename : null;
      const userId = req.session.user.id;

      const result = await db.query(
        `INSERT INTO projects (title, description, start_date, end_date, user_id, image)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [title, description, startDate, endDate, userId, image],
      );

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
  },
);

// ========================================
// DELETE PROJECT
// ========================================
app.get("/delete-project/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // ambil nama gambar dulu
    const project = await db.query("SELECT image FROM projects WHERE id=$1", [
      id,
    ]);

    const imageName = project.rows[0]?.image;

    // hapus file jika ada
    if (imageName) {
      const imagePath = `src/assets/uploads/${imageName}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // hapus relasi tech
    await db.query("DELETE FROM project_technologies WHERE project_id=$1", [
      id,
    ]);

    // hapus project
    await db.query("DELETE FROM projects WHERE id=$1", [id]);

    res.redirect("/project");
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// EDIT PAGE
// ========================================
app.get("/edit-project/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  let userData = req.session.user?.name || null;

  try {
    const techResult = await db.query(`SELECT * FROM technologies`);

    const projectResult = await db.query(
      `SELECT p.*, ARRAY_AGG(pt.technology_id) AS technologies
       FROM projects p
       LEFT JOIN project_technologies pt ON p.id = pt.project_id
       WHERE p.id=$1
       GROUP BY p.id`,
      [id],
    );

    const project = projectResult.rows[0];
    const selectedTech = project?.technologies || [];

    res.render("edit-project", {
      project,
      technologies: techResult.rows,
      selectedTech,
      userData,
    });
  } catch (error) {
    console.log(error);
  }
});

// ========================================
// UPDATE PROJECT
// ========================================
app.post(
  "/edit-project/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { title, startDate, endDate, description, technologies } = req.body;

    try {
      // ambil data lama
      const oldProject = await db.query(
        "SELECT image FROM projects WHERE id=$1",
        [id],
      );

      let imageName = oldProject.rows[0].image;

      // kalau upload gambar baru
      if (req.file) {
        const oldImagePath = `src/assets/uploads/${imageName}`;

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // hapus gambar lama
        }

        imageName = req.file.filename; // pakai gambar baru
      }

      // update project
      await db.query(
        `UPDATE projects 
       SET title=$1, description=$2, start_date=$3, end_date=$4, image=$5
       WHERE id=$6`,
        [title, description, startDate, endDate, imageName, id],
      );

      // hapus tech lama
      await db.query("DELETE FROM project_technologies WHERE project_id=$1", [
        id,
      ]);

      // insert tech baru
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
  },
);

// ========================================
// AUTH ROUTES
// ========================================
app.get("/login", login);
app.post("/login", handleLogin);
app.get("/register", register);
app.post("/register", handleRegister);

// ========================================
// REGISTER
// ========================================
function register(req, res) {
  res.render("register", {
    error: req.flash("error")[0],
    success: req.flash("success")[0],
  });
}

async function handleRegister(req, res) {
  const { name, email, password } = req.body;

  const check = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);

  if (check.rows.length > 0) {
    req.flash("error", "Email sudah terdaftar");
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(`INSERT INTO users(name,email,password) VALUES ($1,$2,$3)`, [
    name,
    email,
    hashedPassword,
  ]);

  req.flash("success", "Register berhasil, silakan login");
  res.redirect("/login");
}

// ========================================
// LOGIN
// ========================================
function login(req, res) {
  res.render("login", {
    error: req.flash("error")[0],
    success: req.flash("success")[0],
  });
}

async function handleLogin(req, res) {
  const { email, password } = req.body;

  const result = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);

  if (result.rows.length === 0) {
    req.flash("error", "Email tidak ditemukan");
    return res.redirect("/login");
  }

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.flash("error", "Password salah");
    return res.redirect("/login");
  }

  req.session.user = {
    id: user.id,
    name: user.name,
  };

  res.redirect("/project");
}

// ========================================
// LOGOUT
// ========================================
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/project");
    }
    res.redirect("/login");
  });
});

// ========================================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
