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

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];

const SEVERITY_STYLES: Record<string, string> = {
  Low: 'bg-gray-200 text-gray-700',
  Medium: 'bg-yellow-400 text-yellow-900',
  High: 'bg-orange-500 text-white',
  Critical: 'bg-red-600 text-white'
};

const SeverityBadge = ({ severity }: { severity?: string }) => {
  if (!severity) return <span className="text-gray-400 text-xs">—</span>;
  const style = SEVERITY_STYLES[severity] ?? 'bg-gray-200 text-gray-700';
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded ${style}`}>
      {severity}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: string }) => (
  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
    {category}
  </span>
);

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

  // Aggregate by category for charts
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    const cat = inc.category || 'Unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 py-8">
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold mb-4 text-gray-800">Incidents by Category</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="45%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold mb-4 text-gray-800">Incident Frequency</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData} margin={{ top: 4, right: 8, left: -16, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Incidents table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Recent Incidents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Root Cause / Solution</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {incidents.map((incident) => {
                let parsed: any = null;
                try {
                  parsed = typeof incident.solution === 'string' ? JSON.parse(incident.solution) : incident;
                } catch {}

                const severity = parsed?.severity ?? incident.severity;
                const rootCause = parsed?.root_cause ?? incident.root_cause;
                const solution = parsed?.solution ?? incident.solution;
                const displayText = rootCause || solution || '—';

                return (
                  <tr key={incident.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {incident.project_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <CategoryBadge category={incident.category} />
                    </td>
                    <td className="px-5 py-3.5">
                      <SeverityBadge severity={severity} />
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-gray-600" title={displayText}>
                      {displayText}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 text-xs">
                      {new Date(incident.created_at * 1000).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
