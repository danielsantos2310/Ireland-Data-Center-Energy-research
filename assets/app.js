(() => {
  'use strict';

  const COLORS = {
    green: '#3ddc97',
    greenMuted: 'rgba(61,220,151,.18)',
    blue: '#5cc8ff',
    amber: '#ffb84d',
    text: '#dce8ee',
    muted: '#78909f',
    grid: 'rgba(255,255,255,.07)',
    panel: '#0c2031'
  };

  const fmt = new Intl.NumberFormat('en-IE');
  const one = new Intl.NumberFormat('en-IE', { maximumFractionDigits: 1 });
  const two = new Intl.NumberFormat('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function toTWh(gwh) {
    return `${two.format(gwh / 1000)} TWh`;
  }

  function chartDefaults() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 650 },
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          labels: { color: COLORS.muted, usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 18 }
        },
        tooltip: {
          backgroundColor: '#07131f',
          borderColor: 'rgba(255,255,255,.12)',
          borderWidth: 1,
          titleColor: '#ffffff',
          bodyColor: '#c8d7df',
          padding: 12,
          cornerRadius: 10
        }
      },
      scales: {
        x: {
          ticks: { color: COLORS.muted, maxRotation: 0 },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: COLORS.muted },
          grid: { color: COLORS.grid },
          border: { display: false }
        }
      }
    };
  }

  function revealOnScroll() {
    const nodes = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });
    nodes.forEach((n) => observer.observe(n));
  }

  function animateCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const counters = document.querySelectorAll('[data-counter]');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.counter);
        const decimals = Number(el.dataset.decimals || 0);
        const started = performance.now();
        const duration = 900;
        function tick(now) {
          const progress = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.7 });
    counters.forEach((el) => observer.observe(el));
  }

  function renderGrowthChart(data) {
    const ctx = document.getElementById('growthChart');
    const opts = chartDefaults();
    opts.plugins.legend.display = false;
    opts.plugins.tooltip.callbacks = {
      label: (c) => ` ${fmt.format(c.raw)} GWh`
    };
    opts.scales.y.ticks.callback = (v) => `${fmt.format(v)} GWh`;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.historical.map((d) => d.year),
        datasets: [{
          label: 'Data-centre electricity',
          data: data.historical.map((d) => d.dataCentreGWh),
          borderColor: COLORS.green,
          backgroundColor: COLORS.greenMuted,
          fill: true,
          tension: 0.28,
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: COLORS.green
        }]
      },
      options: opts
    });
  }

  function renderShareChart(data) {
    const ctx = document.getElementById('shareChart');
    const opts = chartDefaults();
    opts.plugins.legend.display = false;
    opts.plugins.tooltip.callbacks = { label: (c) => ` ${one.format(c.raw)}%` };
    opts.scales.y.suggestedMax = 25;
    opts.scales.y.ticks.callback = (v) => `${v}%`;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.historical.map((d) => d.year),
        datasets: [{
          label: 'Share of metered electricity',
          data: data.historical.map((d) => d.sharePct),
          borderColor: COLORS.blue,
          backgroundColor: 'rgba(92,200,255,.12)',
          fill: true,
          tension: 0.28,
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: COLORS.blue
        }]
      },
      options: opts
    });
  }

  function renderSupplyChart(data) {
    const ctx = document.getElementById('supplyChart');
    const s = data.supply2025;
    const opts = chartDefaults();
    opts.indexAxis = 'y';
    opts.plugins.legend.display = false;
    opts.plugins.tooltip.callbacks = { label: (c) => ` ${fmt.format(c.raw)} GWh` };
    opts.scales.x = {
      beginAtZero: true,
      ticks: { color: COLORS.muted, callback: (v) => `${Math.round(v / 1000)}k` },
      grid: { color: COLORS.grid },
      border: { display: false }
    };
    opts.scales.y = {
      ticks: { color: COLORS.muted },
      grid: { display: false },
      border: { display: false }
    };
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Gas', 'Wind', 'Net imports', 'Other generation', 'Solar', 'Storage discharge'],
        datasets: [{
          data: [s.gas, s.wind, s.netImports, s.otherGeneration, s.solar, s.storage],
          backgroundColor: ['#ffb84d', '#3ddc97', '#5cc8ff', '#6f8290', '#f6d365', '#b187ff'],
          borderRadius: 8,
          barThickness: 26
        }]
      },
      options: opts
    });
  }

  function renderForecastChart(data) {
    const ctx = document.getElementById('forecastChart');
    const historyYears = data.historical.map((d) => d.year);
    const forecastYears = data.forecast.map((d) => d.year);
    const labels = [...historyYears, ...forecastYears];
    const historicalValues = [...data.historical.map((d) => d.dataCentreGWh), ...Array(forecastYears.length).fill(null)];
    const projectedValues = [
      ...Array(historyYears.length - 1).fill(null),
      data.historical[data.historical.length - 1].dataCentreGWh,
      ...data.forecast.map((d) => d.gwh)
    ];
    const opts = chartDefaults();
    opts.plugins.tooltip.callbacks = { label: (c) => ` ${c.dataset.label}: ${fmt.format(Math.round(c.raw))} GWh` };
    opts.scales.y.ticks.callback = (v) => `${Math.round(v / 1000)}k`;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Observed',
            data: historicalValues,
            borderColor: COLORS.green,
            backgroundColor: 'rgba(61,220,151,.08)',
            fill: true,
            tension: .25,
            borderWidth: 3,
            pointRadius: 2.5
          },
          {
            label: 'Holt trend projection',
            data: projectedValues,
            borderColor: COLORS.blue,
            backgroundColor: 'transparent',
            borderDash: [8, 6],
            tension: .22,
            borderWidth: 3,
            pointRadius: 1.5
          }
        ]
      },
      options: opts
    });
  }

  function renderBenchmarkChart(data) {
    const ctx = document.getElementById('benchmarkChart');
    const opts = chartDefaults();
    opts.indexAxis = 'y';
    opts.plugins.legend.display = false;
    opts.plugins.tooltip.callbacks = { label: (c) => ` Index ${one.format(c.raw)} (2024 = 100)` };
    opts.scales.x = {
      beginAtZero: false,
      min: 100,
      suggestedMax: 240,
      ticks: { color: COLORS.muted },
      grid: { color: COLORS.grid },
      border: { display: false }
    };
    opts.scales.y = { ticks: { color: COLORS.muted }, grid: { display: false }, border: { display: false } };
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.benchmark.map((d) => d.label),
        datasets: [{
          data: data.benchmark.map((d) => d.index),
          backgroundColor: data.benchmark.map((d) => d.label.includes('Holt') ? COLORS.green : 'rgba(92,200,255,.62)'),
          borderRadius: 8,
          barThickness: 30
        }]
      },
      options: opts
    });
  }

  function setupSupplySimulator(data) {
    const renew = document.getElementById('renewablesRange');
    const imports = document.getElementById('importsRange');
    const renewOut = document.getElementById('renewablesOutput');
    const importsOut = document.getElementById('importsOutput');
    const domesticOut = document.getElementById('domesticOutput');
    const renewBar = document.getElementById('renewablesBar');
    const domesticBar = document.getElementById('domesticBar');
    const importsBar = document.getElementById('importsBar');
    const renewGwh = document.getElementById('renewablesGwh');
    const domesticGwh = document.getElementById('domesticGwh');
    const importsGwh = document.getElementById('importsGwh');
    const presets = document.querySelectorAll('.preset');
    const total = data.additional2035GWh;

    function update(changed) {
      let r = Number(renew.value);
      let i = Number(imports.value);
      if (r + i > 100) {
        if (changed === 'renew') i = 100 - r;
        else r = 100 - i;
      }
      renew.value = r;
      imports.value = i;
      const d = 100 - r - i;
      renewOut.textContent = `${r}%`;
      importsOut.textContent = `${i}%`;
      domesticOut.textContent = `${d}%`;
      renewBar.style.width = `${r}%`;
      domesticBar.style.width = `${d}%`;
      importsBar.style.width = `${i}%`;
      renewGwh.textContent = toTWh(total * r / 100);
      domesticGwh.textContent = toTWh(total * d / 100);
      importsGwh.textContent = toTWh(total * i / 100);
    }

    renew.addEventListener('input', () => { presets.forEach((b) => b.classList.remove('active')); update('renew'); });
    imports.addEventListener('input', () => { presets.forEach((b) => b.classList.remove('active')); update('imports'); });

    const presetValues = {
      renewables: [70, 10],
      balanced: [50, 20],
      imports: [35, 40]
    };
    presets.forEach((button) => {
      button.addEventListener('click', () => {
        const [r, i] = presetValues[button.dataset.preset];
        renew.value = r;
        imports.value = i;
        presets.forEach((b) => b.classList.toggle('active', b === button));
        update('renew');
      });
    });
    update('renew');
  }

  function setupCapacitySimulator(data) {
    const slider = document.getElementById('windMixRange');
    const windMixOut = document.getElementById('windMixOutput');
    const solarMixOut = document.getElementById('solarMixOutput');
    const windCapacity = document.getElementById('windCapacity');
    const solarCapacity = document.getElementById('solarCapacity');
    const windEnergy = document.getElementById('windEnergy');
    const solarEnergy = document.getElementById('solarEnergy');
    const renewableGWh = data.renewableLedGWh;

    function capacityMW(gwh, cf) {
      return gwh / (8.76 * cf);
    }

    function update() {
      const windPct = Number(slider.value);
      const solarPct = 100 - windPct;
      const windGWh = renewableGWh * windPct / 100;
      const solarGWh = renewableGWh * solarPct / 100;
      const windMW = capacityMW(windGWh, data.capacityFactors.wind);
      const solarMW = capacityMW(solarGWh, data.capacityFactors.solar);
      windMixOut.textContent = `${windPct}%`;
      solarMixOut.textContent = `${solarPct}%`;
      windCapacity.textContent = `${two.format(windMW / 1000)} GW`;
      solarCapacity.textContent = `${two.format(solarMW / 1000)} GW`;
      windEnergy.textContent = `${two.format(windGWh / 1000)} TWh/year`;
      solarEnergy.textContent = `${two.format(solarGWh / 1000)} TWh/year`;
    }
    slider.addEventListener('input', update);
    update();
  }

  function setupCarbonSimulator(data) {
    const slider = document.getElementById('carbonRange');
    const output = document.getElementById('carbonOutput');
    const mt = document.getElementById('carbonMt');
    const inline = document.getElementById('carbonIntensityInline');
    const sentence = document.getElementById('carbonSentence');
    const ring = document.getElementById('carbonRing');
    const presets = document.querySelectorAll('.carbon-preset');

    function update() {
      const intensity = Number(slider.value);
      const emissions = data.additional2035GWh * intensity / 1_000_000;
      output.textContent = `${one.format(intensity)} gCO₂/kWh`;
      inline.textContent = one.format(intensity);
      mt.textContent = two.format(emissions);
      const p = Math.max(0, Math.min(100, intensity / 220 * 100));
      const hue = Math.max(5, 145 - (intensity / 220) * 140);
      ring.style.setProperty('--carbon-p', `${p}%`);
      ring.style.background = `conic-gradient(hsl(${hue} 70% 58%) ${p}%, rgba(255,255,255,.06) 0)`;
      if (intensity >= 170) {
        sentence.textContent = `At this intensity, the incremental demand corresponds to roughly ${two.format(emissions)} Mt CO₂ per year.`;
      } else if (intensity >= 80) {
        sentence.textContent = `Decarbonising to this level cuts the incremental emissions exposure to roughly ${two.format(emissions)} Mt CO₂ per year.`;
      } else {
        sentence.textContent = `A deeply decarbonised grid reduces the same incremental demand to roughly ${two.format(emissions)} Mt CO₂ per year.`;
      }
    }

    slider.addEventListener('input', () => {
      presets.forEach((b) => b.classList.remove('active'));
      update();
    });
    presets.forEach((button) => {
      button.addEventListener('click', () => {
        slider.value = button.dataset.carbon;
        presets.forEach((b) => b.classList.toggle('active', b === button));
        update();
      });
    });
    update();
  }

  async function boot() {
    revealOnScroll();
    animateCounters();

    try {
      const response = await fetch('data/site_data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Story data request failed: ${response.status}`);
      const data = await response.json();

      if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        Chart.defaults.color = COLORS.muted;
        renderGrowthChart(data);
        renderShareChart(data);
        renderSupplyChart(data);
        renderForecastChart(data);
        renderBenchmarkChart(data);
      }

      setupSupplySimulator(data);
      setupCapacitySimulator(data);
      setupCarbonSimulator(data);
    } catch (error) {
      console.error(error);
      const banner = document.createElement('div');
      banner.className = 'data-error';
      banner.textContent = 'Interactive data could not be loaded. The methodology, notebook and repository links remain available.';
      banner.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:999;padding:12px 16px;border-radius:12px;background:#391c1c;color:#ffdede;border:1px solid rgba(255,107,107,.3);font:600 14px system-ui;';
      document.body.appendChild(banner);
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
