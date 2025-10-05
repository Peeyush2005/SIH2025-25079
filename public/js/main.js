// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');
if (menuBtn) menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));

// Smooth scroll for anchor links
if (navLinks) navLinks.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href');
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navLinks.classList.remove('open');
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
}, { threshold: 0.1 });
revealEls.forEach(el => io.observe(el));

// Simulation logic
let sequenceChart;
let hasRunSimulation = false;

document.addEventListener('DOMContentLoaded', function () {
  const runButton = document.getElementById('run-button');
  const outputArea = document.getElementById('output');
  const resultsContainer = document.getElementById('results-container');

  if (runButton) runButton.addEventListener('click', function () {
    outputArea.textContent = 'Running simulation...';
    runButton.disabled = true;

    fetch('/api/run')
      .then(r => r.json())
      .then(({ output }) => {
        outputArea.textContent = output || 'No output received.';
        runButton.disabled = false;
        hasRunSimulation = true;
        
        // Show results container
        if (resultsContainer) {
          resultsContainer.classList.remove('results-hidden');
          resultsContainer.classList.add('results-visible');
        }
        
        return loadChart();
      })
      .catch(() => {
        outputArea.textContent = 'Simulation endpoint unavailable. Showing demo data.';
        runButton.disabled = false;
        hasRunSimulation = true;
        
        // Show results container
        if (resultsContainer) {
          resultsContainer.classList.remove('results-hidden');
          resultsContainer.classList.add('results-visible');
        }
        
        loadChart();
      });
  });
});

function loadChart(){
  return fetch('/api/chart-data')
    .then(r => r.json())
    .then(data => {
      renderChart(data);
      visualizeLogic(data);
      explainChart(data);
    })
    .catch(() => {
      const data = { healthy: { I1: 80, I2: 3 }, faulted: { I1: 60, I2: 15 } };
      renderChart(data);
      visualizeLogic(data);
      explainChart(data);
    });
}

function renderChart(data) {
  const ctx = document.getElementById('sequence-chart').getContext('2d');
  const gridColor = 'rgba(226, 232, 240, .25)';
  const tickColor = '#cbd5e1';
  const chartData = {
    labels: ['Healthy', 'Faulted'],
    datasets: [
      { label: 'I1 (Positive Sequence)', data: [data.healthy.I1, data.faulted.I1], backgroundColor: 'rgba(20, 184, 166, 0.75)' },
      { label: 'I2 (Negative Sequence)', data: [data.healthy.I2, data.faulted.I2], backgroundColor: 'rgba(14, 165, 233, 0.75)' }
    ]
  };
  if (window.sequenceChart) window.sequenceChart.destroy();
  window.sequenceChart = new Chart(ctx, { 
    type: 'bar', 
    data: chartData, 
    options: { 
      responsive: true, 
      scales: { 
        y: { 
          beginAtZero: true, 
          grid: { color: gridColor }, 
          ticks: { color: tickColor } 
        }, 
        x: { 
          ticks: { color: tickColor } 
        } 
      }, 
      plugins:{ 
        legend:{ 
          labels:{ color: tickColor } 
        } 
      } 
    } 
  });
}

function visualizeLogic(data) {
  const container = document.getElementById('logic-visualization');
  const threshold = 0.15;
  const healthy = data.healthy.I2 / Math.max(1e-9, data.healthy.I1);
  const faulted = data.faulted.I2 / Math.max(1e-9, data.faulted.I1);
  container.innerHTML = `
    <h4>Detection logic</h4>
    <p>We compare negative-sequence current (I2) to positive (I1). If the ratio stays above the threshold for the set time, we trip.</p>
    <p><strong>Healthy:</strong> ${healthy.toFixed(4)} (threshold ${threshold}) – <em>${healthy > threshold ? 'Trip' : 'No Trip'}</em></p>
    <p><strong>Faulted:</strong> ${faulted.toFixed(4)} (threshold ${threshold}) – <em>${faulted > threshold ? 'Trip (after delay)' : 'No Trip'}</em></p>
  `;
}

function explainChart(data){
  const box = document.getElementById('chart-explain');
  const msg = `In healthy operation, negative-sequence current (I2) is tiny compared to positive (I1). When a conductor opens, the system becomes unbalanced, so I2 rises sharply while I1 changes only a little. This is why the ratio I2/I1 is a reliable indicator of a broken conductor.`;
  box.textContent = msg;
}
