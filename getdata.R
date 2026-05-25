

library(tidyverse)
library(arrow)


# ── CES data ──────────────────────────────────────────────────────────────────
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
    month     = as.integer(str_remove(period, "^M"))
  )

write_parquet(df, "ces_data.parquet")
message("ces_data.parquet written — ", nrow(df), " rows")

# ── Series info ───────────────────────────────────────────────────────────────
series     <- read_tsv("sm.series.txt",     col_types = cols(.default = col_character())) |> mutate(across(everything(), str_trim))
supersector <- read_tsv("sm.supersector.txt", col_types = cols(.default = col_character())) |> mutate(across(everything(), str_trim))
industry   <- read_tsv("sm.industry.txt",   col_types = cols(.default = col_character())) |> mutate(across(everything(), str_trim))
state      <- read_tsv("sm.state.txt",      col_types = cols(.default = col_character())) |> mutate(across(everything(), str_trim))
data_type  <- read_tsv("sm.data_type.txt",  col_types = cols(.default = col_character())) |> mutate(across(everything(), str_trim))

series_info <- series |>
  left_join(state,       join_by(state_code)) |>
  left_join(supersector, join_by(supersector_code)) |>
  left_join(industry,    join_by(industry_code)) |>
  left_join(data_type,   join_by(data_type_code)) |>
  mutate(
    series_title = str_glue("{industry_name} — {state_name} ({data_type_text})")
  )

write_parquet(series_info, "series_info.parquet")
message("series_info.parquet written — ", nrow(series_info), " rows")
