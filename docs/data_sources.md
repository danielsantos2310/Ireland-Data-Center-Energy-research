# Data Sources

This project prioritises official Irish public-sector and electricity-system sources. Raw source files are preserved unchanged in `data/raw/`.

## 1. CSO — Data Centres Metered Electricity Consumption 2025

**Provider:** Central Statistics Office (CSO), Ireland  
**Table:** MEC02 — Data Centres Metered Electricity Consumption  
**Local raw file:** `data/raw/MEC02.20261111T151111.csv`  
**Unit:** GWh  
**Coverage used:** 2015 Q1–2025 Q4  
**Role in project:** historical data-centre demand, total metered electricity and other-customer consumption.

Official release:  
https://www.cso.ie/en/releasesandpublications/ep/p-dcmec/datacentresmeteredelectricityconsumption2025/

### Data-quality note
The quarterly data-centre observations sum to 7,662 GWh in 2025, while the CSO release headline reports 7,663 GWh. The analysis retains the raw quarterly observations and documents this 1 GWh rounding/aggregation difference.

## 2. CSO — Electricity Supply by Source 2025

**Provider:** Central Statistics Office (CSO), Ireland

### ESSA04 — Annual Electricity Supply by Source

**Local raw file:** `data/raw/ESSA04.20261111T151155.csv`  
**Unit:** GWh  
**Coverage:** 2023–2025  
**Role:** annual wind, solar, gas, generation, imports, exports, storage and total grid supply.

### ESSA02 — Electricity Supply by Month and Supply Source

**Local raw file:** `data/raw/ESSA02.20261111T151141.csv`  
**Unit:** MWh (converted to GWh in processing)  
**Coverage:** January–December 2025  
**Role:** monthly/quarterly supply analysis and 2025 cross-dataset comparison.

Official release:  
https://www.cso.ie/en/releasesandpublications/ep/p-ess/electricitysupplybysource2025/

CSO background notes explicitly state that grid supply is not equal to consumer demand because of transmission/distribution losses and other accounting differences.

## 3. EirGrid — AIRAA 2026–2035

**Provider:** EirGrid / SONI  
**Source:** All-Island Resource Adequacy Assessment 2026–2035 and Ireland inputs/assumptions  
**Role:** benchmark the statistical demand-growth projection against official Low, Median and High Data Centre and New Technology Load scenarios.

Official page:  
https://www.eirgrid.ie/airaa

Values used in the notebook:

- 2024 baseline: 959 MVA
- 2035 Low: 1,402 MVA
- 2035 Median: 1,870 MVA
- 2035 High: 2,183 MVA

### Scope warning
EirGrid's category covers large-scale data centres and other new technology loads with dedicated high-voltage connections. This is broader than the CSO metered data-centre series. The project therefore compares indexed growth, not raw MVA against GWh.

## 4. SEAI — Renewable capacity and carbon assumptions

**Provider:** Sustainable Energy Authority of Ireland (SEAI)

Main statistics portal:  
https://www.seai.ie/data-and-insights/seai-statistics/

Conversion factors:  
https://www.seai.ie/data-and-insights/seai-statistics/conversion-factors

Values used:

- 2024 wind capacity factor: 29.2%
- Solar installed capacity at end-2023: 783.79 MW
- Solar installed capacity at end-2024: 1,323.40 MW
- 2024 solar generation used for the indicative capacity-factor calculation: 1,090 GWh
- Provisional 2025 electricity-consumption emission factor: 197.8 gCO2/kWh

The solar capacity factor in the notebook is an analytical approximation using average 2023/2024 year-end capacity, not an official SEAI capacity-factor statistic.

## Source-handling principles

1. Raw downloaded files are never overwritten.
2. Unit conversions are explicit.
3. Measured historical data, statistical forecasts and illustrative scenarios are clearly separated.
4. Source-scope differences are documented before comparisons are made.
5. Assumptions that are not official forecasts are labelled as sensitivities.
