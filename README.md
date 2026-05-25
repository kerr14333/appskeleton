# CES Data Viewer

A Node.js/Express web application for exploring Bureau of Labor Statistics (BLS) Current Employment Statistics (CES) data for Pennsylvania.

## Features

- **Time series chart** — interactive Plotly.js line chart for any selected series
- **Data table** — Tabulator.js table with sorting and formatted values, shown via tab on the same page
- **Sidebar series selector** — dropdown populated with human-readable series titles
- **Authentication** — session-based login with LDAP support and a dev bypass mode
- **DuckDB backend** — data served from Parquet files via an in-memory DuckDB instance

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [R](https://www.r-project.org/) with the following packages:
  - `tidyverse`
  - `arrow`

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/kerr14333/appskeleton.git
cd appskeleton
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Download BLS data files

Download the following files from the BLS website and save them to the project root directory:

| File | URL |
|---|---|
| `sm.data.39a.Pennsylvania.txt` | https://download.bls.gov/pub/time.series/sm/sm.data.39a.Pennsylvania |
| `sm.series.txt` | https://download.bls.gov/pub/time.series/sm/sm.series |
| `sm.supersector.txt` | https://download.bls.gov/pub/time.series/sm/sm.supersector |
| `sm.industry.txt` | https://download.bls.gov/pub/time.series/sm/sm.industry |
| `sm.state.txt` | https://download.bls.gov/pub/time.series/sm/sm.state |
| `sm.data_type.txt` | https://download.bls.gov/pub/time.series/sm/sm.data_type |

### 4. Generate Parquet files

Run the R script to process the raw data files and write the Parquet files:

```r
source("getdata.R")
```

This produces:
- `ces_data.parquet` — 132,955 rows of monthly employment observations
- `series_info.parquet` — series metadata with human-readable titles

### 5. Configure environment

Create a `.env` file in the project root:

```
# Session
SESSION_SECRET=your-long-random-secret-here

# Dev bypass (set to false and configure LDAP_ vars for production)
DEV_BYPASS=true
DEV_USERNAME=admin
DEV_PASSWORD=your-password-here

# LDAP (used when DEV_BYPASS=false)
LDAP_URL=ldap://your-ldap-server:389
LDAP_USER_DN=cn={{username}},ou=users,dc=example,dc=com
```

### 6. Start the app

```bash
npm start
```

The app will be available at `http://localhost:3001`. You will be redirected to the login page automatically.

## Project structure

```
.
├── app.js                  # Express app entry point, session + auth wiring
├── db.js                   # DuckDB connection, Parquet view registration
├── ldap.js                 # LDAP authentication + dev bypass logic
├── getdata.R               # R script — reads BLS txt files, writes Parquet
├── middleware/
│   └── auth.js             # Route protection middleware
├── routes/
│   └── index.js            # Page and API routes
├── views/
│   ├── index.ejs           # Dashboard — chart + data tabs
│   ├── login.ejs           # Login page (standalone, no layout)
│   ├── layouts/
│   │   └── main.ejs        # Shared layout wrapper
│   └── partials/
│       ├── header.ejs      # Navbar with username + sign out
│       ├── sidebar.ejs     # Series dropdown
│       └── footer.ejs      # Footer
└── .env                    # Environment config (not committed)
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/series` | All series IDs with human-readable titles |
| `GET` | `/api/series/:id` | Time series data + metadata for a single series |

## Authentication

The app uses session-based authentication. In development, set `DEV_BYPASS=true` in `.env` and supply `DEV_USERNAME` / `DEV_PASSWORD`. Sessions expire after 8 hours.

To connect to a real LDAP server, set `DEV_BYPASS=false` and configure `LDAP_URL` and `LDAP_USER_DN`. The `{{username}}` placeholder in `LDAP_USER_DN` is replaced with the entered username at login time.

## Data source

Data sourced from the [U.S. Bureau of Labor Statistics](https://www.bls.gov/) Current Employment Statistics (CES) program. Raw data files are not included in this repository and must be downloaded separately.
