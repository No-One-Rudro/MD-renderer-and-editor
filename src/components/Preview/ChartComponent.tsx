import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartComponentProps {
  csvData: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ChartComponent: React.FC<ChartComponentProps> = ({ csvData }) => {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return <div className="p-4 text-red-500">Invalid CSV data for chart</div>;

  const header = lines[0].split(',').map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    header.forEach((h, i) => {
      const val = values[i];
      obj[h] = isNaN(Number(val)) ? val : Number(val);
    });
    return obj;
  });

  const valueKey = header[1];
  const labelKey = header[0];

  return (
    <div className="w-full h-[300px] my-6 bg-white/5 p-4 rounded-xl border border-white/10">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={labelKey} stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
          <Bar dataKey={valueKey} fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
