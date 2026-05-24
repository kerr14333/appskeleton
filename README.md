# CES Data Viewer

A Node.js/Express web application for exploring the Bureau of Labor Statistics (BLS) Current Employment Statistics (CES) data for Pennsylvania.

## Features

- Browse 700+ employment series via a searchable dropdown
- Interactive time series chart powered by [Plotly.js](https://plotly.com/javascript/)
- Tabular data view powered by [Tabulator](https://tabulator.info/)
- Human-readable series titles built from BLS lookup tables
- SQLite backend for fast, offline queries

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [R](https://www.r-project.org/) v4.0+ with the following packages:
  - `tidyverse`
  - `DBI`
  - `RSQLite`

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd CesDataViewer
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Download the BLS data files

Download the following files from the BLS website and place them in the project root:

| File | URL |
|------|-----|
| `sm.data.39a.Pennsylvania.txt` | https://download.bls.gov/pub/time.series/sm/sm.data.39a.Pennsylvania |
| `sm.series.txt` | https://download.bls.gov/pub/time.series/sm/sm.series |
| `sm.industry.txt` | https://download.bls.gov/pub/time.series/sm/sm.industry |
| `sm.supersector.txt` | https://download.bls.gov/pub/time.series/sm/sm.supersector |
| `sm.state.txt` | https://download.bls.gov/pub/time.series/sm/sm.state |
| `sm.data_type.txt` | https://download.bls.gov/pub/time.series/sm/sm.data_type |

### 4. Build the SQLite database

Open R and run:

```r
source("getdata.R")
```

This reads the BLS text files, joins the lookup tables to build human-readable series titles, and writes everything to `ces.db`.

### 5. Start the app

```bash
npm start
```

The app will be available at [http://localhost:3001](http://localhost:3001).

For development with auto-reload:

```bash
npm run dev
```

## Project Structure

```
CesDataViewer/
├── app.js              # Express app entry point
├── db.js               # SQLite connection (better-sqlite3)
├── getdata.R           # R script to build ces.db from BLS text files
├── routes/
│   └── index.js        # All routes and API endpoints
└── views/
    ├── index.ejs        # Dashboard page (chart + data tabs)
    ├── layouts/
    │   └── main.ejs     # Shared page layout
    └── partials/
        ├── header.ejs   # Navbar and asset includes
        ├── sidebar.ejs  # Series dropdown
        └── footer.ejs   # Page footer
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/series` | List all series IDs with titles |
| `GET` | `/api/series/:id` | Get time series data for a single series |

## Data Source

Data is sourced from the [BLS State and Metro Area Employment (SM)](https://www.bls.gov/sae/) program. Files are not included in this repository and must be downloaded separately.
