import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import hbs from "hbs";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// register partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// static files
app.use(express.static(path.join(__dirname, "public")));

// route utama
app.get("/", (req, res) => {
  res.render("home", { title: "Fadhlan Faidh" });
});

app.listen(port, () => {
  console.log(`Server running di http://localhost:${port}`);
});
