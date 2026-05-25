const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/plotly', express.static(path.join(__dirname, 'node_modules/plotly.js-dist-min')));
app.use('/tabulator', express.static(path.join(__dirname, 'node_modules/tabulator-tables/dist')));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.locals.appName = 'CES Data Viewer';

const config = { appName: app.locals.appName };

// Database
const db = require('./db');

// Routes — registered after db is ready
const indexRouter = require('./routes/index');

const PORT = process.env.PORT || 3001;

db.init()
  .then(() => {
    app.use('/', indexRouter(db, config));
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });