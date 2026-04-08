import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface StackedBarChartProps {
  data: {
    status: string;
    none: number;
    approved: number;
    scheduled: number;
    inTransit: number;
    complete: number;
  }[];
}

export function DispositionBarChart({ data }: StackedBarChartProps) {
  // assuming you're using just the first object (or aggregate if needed)
  const transformedData = [
    { name: "None", value: data[0]?.none || 0 },
    { name: "Approved", value: data[0]?.approved || 0 },
    { name: "Scheduled", value: data[0]?.scheduled || 0 },
    { name: "In Transit", value: data[0]?.inTransit || 0 },
    { name: "Complete", value: data[0]?.complete || 0 },
  ];

  return (
    <div className= "flex justify-center flex-col items-center ">
      <h1 className=" ml-10 text-md font-semibold">Assets Per Disposition Stage</h1>
    <BarChart width={500} height={300} data={transformedData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#aa998f" />
    </BarChart>
    </div>
  );


}