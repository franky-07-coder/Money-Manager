import Chart from "react-apexcharts";

const options = {
  labels: ["Income", "Expenses"],
  colors: ["#4973ec", "#fa817a"],
  chart: { type: "donut", toolbar: { show: false }, fontFamily: "DM Sans, sans-serif" },
  stroke: { width: 4, colors: ["#fff"] },
  states: { hover: { filter: { type: "lighten", value: 0.04 } }, active: { filter: { type: "none" } } },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { expandOnClick: false, donut: { size: "76%" } } },
  tooltip: { y: { formatter: (value) => `₹${Number(value).toLocaleString("en-IN")}` } },
};

export default function TransactionChartSummary({ expense = 0, income = 0 }) {
  return <Chart options={options} series={[income, expense]} type="donut" width="100%" height={220} />;
}
