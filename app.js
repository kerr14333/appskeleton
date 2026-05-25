require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const { authenticate } = require('./ldap');
const { requireAuth } = require('./middleware/auth');

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

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production');
    }
    console.warn('WARNING: SESSION_SECRET not set, using insecure default');
    return 'dev-secret-change-me';
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  }
}));

// Expose session user to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.locals.appName = 'CES Data Viewer';
const config = { appName: app.locals.appName };

// ── Auth routes (no auth required) ───────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { layout: false, appName: config.appName, error: null, username: '' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await authenticate(username, password);

  if (result.ok) {
    req.session.user = { username: result.username };
    return res.redirect('/');
  }

  res.render('login', {
    layout: false,
    appName: config.appName,
    error: result.message,
    username,
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ── Protected routes ──────────────────────────────────────────────────────────
app.use(requireAuth);

const db = require('./db');
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