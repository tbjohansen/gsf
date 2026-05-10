import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { 
  DollarSign, TrendingUp, Users, Home, 
  Filter, Calendar, Download, RefreshCw,
  PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon
} from 'lucide-react';

const DashboardPage = ({ data = [] }) => {
  const [dateRange, setDateRange] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequestType, setSelectedRequestType] = useState('all');

  // Process data for charts
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Filter data based on selections
    let filteredData = [...data];
    
    if (selectedStatus !== 'all') {
      filteredData = filteredData.filter(item => item.Customer_Status === selectedStatus);
    }
    
    if (selectedRequestType !== 'all') {
      filteredData = filteredData.filter(item => item.Request_Type === selectedRequestType);
    }
    
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;
      switch (dateRange) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filteredData = filteredData.filter(item => {
          const itemDate = parseISO(item.Request_Date);
          return itemDate >= startDate;
        });
      }
    }

    return filteredData;
  }, [data, dateRange, selectedStatus, selectedRequestType]);

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const monthlyMap = {};
    
    processedData.forEach(item => {
      const date = parseISO(item.Request_Date);
      const monthYear = format(date, 'MMM yyyy');
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = {
          month: monthYear,
          revenue: 0,
          requests: 0,
          pending: 0,
          served: 0,
          rejected: 0
        };
      }
      
      monthlyMap[monthYear].revenue += item.Price || 0;
      monthlyMap[monthYear].requests += 1;
      
      if (item.Customer_Status === 'pending' || item.Customer_Status === 'requested') {
        monthlyMap[monthYear].pending += 1;
      } else if (item.Customer_Status === 'served') {
        monthlyMap[monthYear].served += 1;
      } else if (item.Customer_Status === 'rejected') {
        monthlyMap[monthYear].rejected += 1;
      }
    });
    
    return Object.values(monthlyMap).sort((a, b) => 
      parseISO(`01 ${a.month}`) - parseISO(`01 ${b.month}`)
    );
  }, [processedData]);

  // Request type distribution
  const requestTypeData = useMemo(() => {
    const typeMap = {};
    
    processedData.forEach(item => {
      const type = item?.Request_Type || 'Unknown';
      if (!typeMap[type]) {
        typeMap[type] = { name: type, value: 0, revenue: 0 };
      }
      typeMap[type].value += 1;
      typeMap[type].revenue += item?.Price || 0;
    });
    
    return Object.values(typeMap);
  }, [processedData]);

  // Status distribution
  const statusData = useMemo(() => {
    const statusMap = {};
    
    processedData.forEach(item => {
      const status = item?.Customer_Status || 'Unknown';
      if (!statusMap[status]) {
        statusMap[status] = { name: status, value: 0 };
      }
      statusMap[status].value += 1;
    });
    
    return Object.values(statusMap);
  }, [processedData]);

  // Top customers by revenue
  const topCustomers = useMemo(() => {
    const customerMap = {};
    
    processedData.forEach(item => {
      const customer = item.customer?.Customer_Name || 'Unknown';
      if (!customerMap[customer]) {
        customerMap[customer] = {
          name: customer,
          revenue: 0,
          requests: 0,
          type: item.customer?.Customer_Nature || 'Unknown'
        };
      }
      customerMap[customer].revenue += item.Price || 0;
      customerMap[customer].requests += 1;
    });
    
    return Object.values(customerMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [processedData]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalRevenue = processedData.reduce((sum, item) => sum + (item.Price || 0), 0);
    const totalRequests = processedData.length;
    const avgRequestValue = totalRequests > 0 ? totalRevenue / totalRequests : 0;
    
    const servedRequests = processedData.filter(item => 
      ['served', 'requested', 'pending'].includes(item?.Customer_Status)
    ).length;
    
    const successRate = totalRequests > 0 ? (servedRequests / totalRequests) * 100 : 0;
    
    return {
      totalRevenue,
      totalRequests,
      avgRequestValue,
      successRate,
      pendingRequests: processedData.filter(item => 
        ['pending', 'requested'].includes(item.Customer_Status)
      ).length,
      servedRequests
    };
  }, [processedData]);

  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const STATUS_COLORS = {
    requested: '#3B82F6',
    served: '#10B981',
    rejected: '#EF4444',
    pending: '#F59E0B',
    expired: '#6B7280'
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-gray-600 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold">
                {entry.name === 'Revenue' 
                  ? `${entry.value.toLocaleString()} TZS`
                  : entry.value.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="requests" 
                name="Requests" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={monthlyData}
              barSize={30} 
              barGap={4} 
              barCategoryGap={16} 
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="revenue" 
                name="Revenue" 
                fill="#8884d8" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="requests" 
                name="Requests" 
                fill="#82ca9d" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={requestTypeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {requestTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'value') {
                    return [`${value} requests (${props.payload.revenue.toLocaleString()} TZS)`, 'Requests'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  console.log(statusData);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GSF Projects Dashboard</h1>
              <p className="text-gray-600">Real-time financial insights and analytics</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={18} />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-gray-700 font-medium">Filters:</span>
            </div>
            
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="served">Served</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              value={selectedRequestType}
              onChange={(e) => setSelectedRequestType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="farm">Farm</option>
              <option value="house_rent">House Rent</option>
              <option value="business_land">Business Land</option>
              <option value="oxygen">Oxygen</option>
            </select>
            
            <div className="ml-auto flex gap-2">
              <button 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                onClick={() => setChartType('bar')}
              >
                <BarChart3 size={18} />
                Bar
              </button>
              <button 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                onClick={() => setChartType('line')}
              >
                <LineChartIcon size={18} />
                Line
              </button>
              <button 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${chartType === 'pie' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon size={18} />
                Pie
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-2">
                  {kpis.totalRevenue.toLocaleString()} TZS
                </h3>
                <p className="text-green-600 text-sm mt-1">
                  <TrendingUp size={14} className="inline mr-1" />
                  From {processedData.length} requests
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Requests</p>
                <h3 className="text-2xl font-bold mt-2">{kpis.totalRequests}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {kpis.servedRequests} served • {kpis.pendingRequests} pending
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg. Request Value</p>
                <h3 className="text-2xl font-bold mt-2">
                  {kpis.avgRequestValue.toLocaleString()} TZS
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Per successful request
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Success Rate</p>
                <h3 className="text-2xl font-bold mt-2">{kpis.successRate.toFixed(1)}%</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Requests served vs total
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Home className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revenue & Requests Trend</h2>
              <p className="text-gray-600">Monthly performance overview</p>
            </div>
            <div className="text-sm text-gray-500">
              Showing {monthlyData.length} months of data
            </div>
          </div>
          <div className="h-[400px]">
            {renderChart()}
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Request Type Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {requestTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'value') {
                        return [`${value} requests (${props.payload.revenue.toLocaleString()} TZS)`, 'Requests'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'value') {
                        return [value, 'Requests'];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                  >
                    {statusData?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Customers by Revenue</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.revenue.toLocaleString()} TZS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round(customer.revenue / customer.requests).toLocaleString()} TZS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;