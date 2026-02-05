import express from "express";
const app = express();
const port = 3000;

app.set("view engine", "hbs");
app.set("views", "src/views");

app.use("/assets", express.static("src/assets"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/project", (req, res) => {
  res.render("project");
});

app.get("/contact", contact);

app.post("/contact", handleContact);

app.get("/project-detail/:id", (req, res) => {
  res.render("project-detail");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function contact(req, res) {
  const phoneNumber = 6282144776410;
  res.render("contact", { phoneNumber });
}

let accounts = [];

function handleContact(req, res) {
  // let name = req.body.name
  // let password = req.body.password

  let { name, email, phoneNumber, subject, message } = req.body;

  console.log(name, email, phoneNumber, subject, message);

  let account = {
    name,
    email,
    phoneNumber,
    subject,
    message,
  };

  accounts.push(account);
  console.log(accounts);
}
