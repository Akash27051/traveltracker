import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
// database connection
const db = new pg.Client({
  host: "localhost",
  port: 5432,
  database: "world",
  user: "postgres",
  password: "root",
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let totalCounrty = [];
async function sqlQuery() {
  const result9 = await db.query("SELECT country FROM country_visited");
  totalCounrty = result9.rows;

  let cntry = [];
  for (let i = 0; i < totalCounrty.length; i++) {
    cntry[i] = totalCounrty[i].country;
    console.log(cntry[i]);
  }
  return cntry;
}

app.get("/", async (req, res) => {
  let cntry = await sqlQuery();
  res.render("index.ejs", { total: totalCounrty.length, countries: cntry });
});

app.post("/add", async (req, res) => {
  const newCountry = req.body.country;
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name ILIKE $1 || '%'",
      [newCountry]
    );
    const countryCode = result.rows[0].country_code;
    try {
      await db.query("INSERT INTO country_visited (country) VALUES ($1)", [
        countryCode,
      ]);
      res.redirect("/");
      
    } catch (error) {
      console.log("Hi Some Error is there:- " + error.message);
    const result = await sqlQuery();
    res.render("index.ejs", {
      total: totalCounrty.length,
      countries: result,
      error: "Country name already exist, try again.",
    });

      
    }
  } catch (error) {
    console.log("Hi Some Error is there:- " + error.message);
    const result = await sqlQuery();
    res.render("index.ejs", {
      total: totalCounrty.length,
      countries: result,
      error: "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
