

library(tidyverse)
library(DBI)
library(RSQLite)


# Read the data file
df <- read_tsv(
  file = "sm.data.39a.Pennsylvania.txt",
  col_types = cols(
    series_id      = col_character(),
    year           = col_integer(),
    period         = col_character(),
    value          = col_double(),
    footnote_codes = col_character()
  )
) |>
  mutate(
    series_id = str_trim(series_id),
    # Convert period (M01-M13) to month integer; M13 is annual average
    month = as.integer(str_remove(period, "^M"))
  )

# Connect (creates file if it doesn't exist)
con <- dbConnect(RSQLite::SQLite(), "ces.db")

# Write table, replacing if it already exists
dbWriteTable(con, "ces_data", df, overwrite = TRUE)

# Add an index on series_id for fast lookups
dbExecute(con, "CREATE INDEX IF NOT EXISTS idx_series_id ON ces_data(series_id)")
dbExecute(con, "CREATE INDEX IF NOT EXISTS idx_year ON ces_data(year)")

dbDisconnect(con)

message("Done — ces.db written with ", nrow(df), " rows.")
