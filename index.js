import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'rushikeshwayal@007',
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/", async (req, res) => {
  const { country } = req.body;
  console.log(country);
  let errors = [];

  try {
    const checkCode = await db.query('SELECT * FROM visited_countries WHERE country_code = $1', [country]);

    if (checkCode.rows.length > 0) {
      errors.push('Country code already exists');
      const result = await db.query('SELECT country_code FROM visited_countries');
      let countries = [];
      result.rows.forEach((country) => {
        countries.push(country.country_code);
      });

      res.render('index', { errors: errors, countries: countries, total: countries.length });
    } else {
      await db.query('INSERT INTO visited_countries (country_code) VALUES ($1)', [country]);
      res.redirect('/');
    }
  } catch (error) {
    console.log(error);
    errors.push('Database error');
    res.render('index', { errors: errors, countries: [], total: 0 });
  }
});

app.get('/', async (req, res) => {
  const result = await db.query('SELECT country_code FROM visited_countries');
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  res.render('index', { errors: [], countries: countries, total: countries.length });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
  