const COLORS = ["rgb(140, 214, 16)", "rgb(239, 198, 0)", "rgb(231, 24, 49)"];
const rangeInput = document.getElementById("valueRange");
const valueLabel = document.getElementById("valueLabel");
const aqiCtx = document.getElementById("aqiChart");

function getColor(value) {
  if (value < 70) return COLORS[0];
  if (value < 90) return COLORS[1];
  return COLORS[2];
}

let value = parseInt(rangeInput.value);

const chart = new Chart(aqiCtx, {
  type: "doughnut",
  data: {
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [getColor(value), "rgb(234,234,234)"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  },
  options: {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    circumference: 180,
    rotation: -90,
  },
});

function updateChart(newValue) {
  chart.data.datasets[0].data = [newValue, 100 - newValue];
  chart.data.datasets[0].backgroundColor[0] = getColor(newValue);
  chart.update();

  valueLabel.textContent = `${newValue}%`;
}

rangeInput.addEventListener("input", (e) => {
  updateChart(parseInt(e.target.value));
});
