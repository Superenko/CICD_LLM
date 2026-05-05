import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useOutletContext } from 'react-router';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { getIncidents } from '@/server/apps';
import Loading from '@/components/icons/Loading';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57'];

export const Analytics = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setPageTitle } = useOutletContext<{ setPageTitle: Dispatch<SetStateAction<string>> }>();

  useEffect(() => {
    setPageTitle('Analytics Dashboard');
  }, [setPageTitle]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setIsLoading(true);
        const data = await getIncidents();
        setIncidents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch incidents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loading className="size-8 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (incidents.length === 0) {
    return <div className="text-gray-500 p-6 text-center mt-12 text-lg">No incident data available yet.</div>;
  }

  // Aggregate by category
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    const cat = inc.category || 'Unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Incidents by Category</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-lg font-semibold mb-6">Incident Frequency</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Incidents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Solution / Detail</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{incident.project_name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {incident.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-md truncate" title={incident.solution}>
                    {incident.solution}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(incident.created_at * 1000).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
