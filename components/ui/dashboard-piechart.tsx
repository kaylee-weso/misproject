import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface PieChartProps {
  data: { name: string; value: number }[];
}

export function StatusPieChart({ data }: PieChartProps) {
  const COLORS = ["#81b29a", "#f2cc8f", "#8ecae6"]; // green, yellow, red
  return (
    <div className= "flex justify-center flex-col items-center ">
      <h1 className=" text-md font-semibold">Assets Per Status</h1>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}