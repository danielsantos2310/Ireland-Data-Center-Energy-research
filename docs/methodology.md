# Methodology

## Research question

How has data-centre growth changed Ireland's electricity demand, and what could continued growth mean for the Irish electricity system through 2035?

## 1. Data ingestion and preservation

The project uses three downloaded CSO CSV datasets. Original source files are preserved unchanged in `data/raw/`. Transformations are written to `data/processed/`.

Schema, unit and missing-value checks are performed before analysis.

## 2. Data-centre demand processing

MEC02 is reshaped from long to wide format with one row per quarter. The following metrics are derived:

- annual data-centre electricity consumption
- data-centre share of total metered electricity
- quarter-on-quarter growth
- same-quarter year-on-year growth
- rolling four-quarter consumption
- annual year-on-year growth
- contribution of data centres to net metered-demand growth

The analysis uses the quarterly observations as provided. Their 2025 sum is 7,662 GWh, compared with the CSO headline value of 7,663 GWh; the difference is documented rather than adjusted.

## 3. Electricity-supply processing

ESSA04 is reshaped into annual 2023–2025 supply-source columns.

ESSA02 is reshaped into monthly 2025 columns, converted from MWh to GWh, and used to derive:

- net imports = imports + exports (exports are negative in the raw table)
- storage discharge = pumped-storage discharge + battery discharge
- total electricity supplied = total generation + net imports + storage discharge

As a quality check, the monthly-derived 2025 total is compared with the annual ESSA04 total.

## 4. Cross-dataset analysis

Monthly grid-supply data are aggregated to calendar quarters and joined one-to-one to 2025 quarterly data-centre consumption.

Only four joined observations are available, so this section is descriptive. The final notebook deliberately avoids treating four-point correlations as statistical evidence or causation.

## 5. Forecast validation

The forecast comparison uses 2024 Q1–2025 Q4 as an eight-quarter validation window.

A **rolling-origin one-step-ahead** procedure is used:

1. Forecast the next quarter using only observations available before that quarter.
2. Add the observed quarter to the history.
3. Refit each model.
4. Repeat through 2025 Q4.

Models compared:

- seasonal naive
- linear trend
- exponential/log-linear trend
- Holt damped trend

Evaluation metrics:

- MAE
- RMSE
- MAPE
- R²

The model with the lowest validation RMSE is selected. With the current data, Holt damped trend is the best-performing tested model.

## 6. Long-run trend projection

After model selection, the Holt damped-trend model is refit to the complete 2015 Q1–2025 Q4 data-centre series and projected for 40 quarters (2026–2035).

This is described as a **statistical trend projection**, not a deterministic prediction.

## 7. EirGrid benchmark

The statistical projection is compared with EirGrid's AIRAA 2035 Low, Median and High Data Centre and New Technology Load scenarios.

Because the two sources use different scopes and units:

- CSO: GWh metered data-centre consumption
- EirGrid: MVA Data Centre and New Technology Load

both are normalised to a 2024 index of 100. No MVA-to-GWh conversion is attempted.

## 8. Electricity-system scenarios

The projected 2035 data-centre demand is compared with the 2025 baseline to calculate incremental annual GWh and equivalent average continuous MW.

Three illustrative supply mixes are tested:

- Renewables-led: 70% renewables / 20% domestic flexible supply / 10% net imports
- Balanced: 50% / 30% / 20%
- Import-heavy: 35% / 25% / 40%

These are analytical sensitivities, not official forecasts.

## 9. Renewable-capacity sensitivity

For the renewables-led case, the renewable portion is split 70% wind / 30% solar.

Required installed capacity is estimated as:

`MW = annual GWh / (8.76 × capacity factor)`

Wind uses SEAI's 2024 capacity factor of 29.2%.

The solar capacity factor is an indicative calculation based on average end-2023/end-2024 installed capacity and 2024 generation. It is not presented as an official SEAI capacity-factor value.

## 10. Carbon-intensity sensitivity

Incremental 2035 electricity demand is evaluated under three grid-intensity assumptions:

- 197.8 gCO2/kWh — official provisional SEAI 2025 electricity-consumption factor
- 100 gCO2/kWh — analytical sensitivity
- 50 gCO2/kWh — analytical sensitivity

The SEAI factor captures emissions arising within Ireland and excludes emissions from electricity generated abroad and imported into Ireland. Results are therefore Irish grid-emissions sensitivities rather than lifecycle footprints.

## Limitations

- National aggregate data cannot explain site-level data-centre efficiency, workloads or PUE.
- Grid-supply history is short in the selected files.
- Grid supply and consumer metered demand are not equivalent concepts.
- The 2025 joined grid/data-centre sample has only four quarterly observations.
- Long-horizon trend projections can be disrupted by regulation, connection policy, technology, economic conditions and customer build-out.
- EirGrid and CSO data-centre categories are not identical.
- Renewable-capacity results depend on illustrative technology shares and capacity-factor assumptions.
- Carbon results do not include imported-generation emissions or lifecycle emissions.
