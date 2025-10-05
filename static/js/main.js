document.addEventListener('DOMContentLoaded', function() {
    const runButton = document.getElementById('run-button');
    const outputArea = document.getElementById('output');

    runButton.addEventListener('click', function() {
        outputArea.textContent = 'Running simulation...';
        runButton.disabled = true;

        fetch('/run_simulation')
            .then(response => response.json())
            .then(data => {
                outputArea.textContent = data.output;
                runButton.disabled = false;
            })
            .catch(error => {
                console.error('Error:', error);
                outputArea.textContent = 'An error occurred during simulation.';
                runButton.disabled = false;
            });
    });

    // Fetch data and render chart on page load
    fetch('/get_chart_data')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Chart Error:', data.error);
                return;
            }
            renderChart(data);
            visualizeLogic(data);
        })
        .catch(error => console.error('Error fetching chart data:', error));
});

function renderChart(data) {
    const ctx = document.getElementById('sequence-chart').getContext('2d');
    
    // Simple bar chart for demonstration
    const chartData = {
        labels: ['Healthy', 'Faulted'],
        datasets: [
            {
                label: 'I1 (Positive Sequence)',
                data: [data.healthy.I1, data.faulted.I1],
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
                label: 'I2 (Negative Sequence)',
                data: [data.healthy.I2, data.faulted.I2],
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
        ]
    };

    // This requires a charting library like Chart.js
    // For now, let's just log the data to show it's working
    console.log(chartData);
    
    // We will use a simple canvas drawing for now
    // drawBarChart(ctx, chartData);
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function visualizeLogic(data) {
    const container = document.getElementById('logic-visualization');
    const i2_i1_threshold = 0.15; // From the python script

    const healthy_ratio = data.healthy.I1 > 0 ? data.healthy.I2 / data.healthy.I1 : 0;
    const faulted_ratio = data.faulted.I1 > 0 ? data.faulted.I2 / data.faulted.I1 : 0;

    let healthy_html = `<h4>Healthy State:</h4>
        <p>I2/I1 Ratio: ${healthy_ratio.toFixed(4)}</p>
        <p>Threshold: ${i2_i1_threshold}</p>
        <p><strong>Result:</strong> Ratio is below threshold. No trip.</p>`;

    let faulted_html = `<h4>Faulted State:</h4>
        <p>I2/I1 Ratio: ${faulted_ratio.toFixed(4)}</p>
        <p>Threshold: ${i2_i1_threshold}</p>
        <p><strong>Result:</strong> Ratio is above threshold. Trip signal issued after time delay.</p>`;

    container.innerHTML = healthy_html + faulted_html;
}


// This function is no longer needed
/*
function drawBarChart(ctx, chartData) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    const barWidth = 40;
    const spacing = 60;
    
    const maxValue = Math.max(...chartData.datasets.flatMap(d => d.data));
    const scale = (height - padding * 2) / maxValue;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px Arial';

    chartData.labels.forEach((label, i) => {
        const x_pos = padding + i * (barWidth * 2 + spacing);
        ctx.fillText(label, x_pos + barWidth / 2, height - padding / 2);

        chartData.datasets.forEach((dataset, j) => {
            const barHeight = dataset.data[i] * scale;
            ctx.fillStyle = dataset.backgroundColor;
            ctx.fillRect(x_pos + j * barWidth, height - padding - barHeight, barWidth, barHeight);
        });
    });
}
*/
