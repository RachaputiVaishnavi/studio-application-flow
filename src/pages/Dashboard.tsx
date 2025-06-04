import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formApi } from "@/services/api";
import { evaluationApi } from "@/services/api";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Currency conversion rates (you would typically fetch these from an API)
const CURRENCY_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
};

const Dashboard = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formsResponse, evaluationsResponse] = await Promise.all([
          formApi.getForms(),
          evaluationApi.getEvaluations()
        ]);
        setApplications(formsResponse.data.data);
        setEvaluations(evaluationsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Convert amount to selected currency
  const convertCurrency = (amount: number, fromCurrency: string) => {
    const inrAmount = amount * (1 / CURRENCY_RATES[fromCurrency as keyof typeof CURRENCY_RATES]);
    return inrAmount * CURRENCY_RATES[selectedCurrency as keyof typeof CURRENCY_RATES];
  };

  // Calculate summary statistics
  const totalApplications = applications.length;
  const selectedStartups = evaluations.filter(evaluation => 
    evaluation.projectStatus === 'Selected'
  ).length;
  
  // Calculate average funding ask from form data
  const averageFundingAsk = applications.length > 0 
    ? applications.reduce((sum, app) => {
        // Get funding amount and currency from form data
        const amount = app.fundingAmount || 0;
        const currency = app.fundingCurrency || 'INR';
        return sum + convertCurrency(amount, currency);
      }, 0) / applications.length
    : 0;
  
  // Calculate pending reviews from evaluations
  const pendingReviews = evaluations.filter(evaluation => {
    const status = evaluation.projectStatus;
    return status === 'New' || status === 'Round 1' || status === 'Round 2';
  }).length;

  // Add console logs for debugging
  console.log('Applications:', applications);
  console.log('Evaluations:', evaluations);
  console.log('Average Funding Ask:', averageFundingAsk);
  console.log('Pending Reviews:', pendingReviews);

  // Prepare data for charts
  const stageData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.currentState] = (acc[app.currentState] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const industryData = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.industry] = (acc[app.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Calculate application status data from evaluations
  const statusData = Object.entries(
    evaluations.reduce((acc, evaluation) => {
      const status = evaluation.projectStatus || 'New';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Get all months in the last 12 months
  const getLast12Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }
    return months;
  };

  // Calculate monthly applications with proper date handling
  const monthlyApplicationsData = getLast12Months().map(month => {
    const count = applications.filter(app => {
      const appDate = new Date(app.submissionDate);
      const appMonth = appDate.toLocaleString('default', { month: 'short' });
      return appMonth === month;
    }).length;
    return { name: month, applications: count };
  });

  // Calculate funding distribution with proper currency conversion
  const fundingDistributionData = [
    { 
      range: "<₹10L", 
      count: applications.filter(app => {
        const amount = convertCurrency(app.fundingAmount, app.fundingCurrency);
        return amount < 1000000;
      }).length 
    },
    { 
      range: "₹10L-₹25L", 
      count: applications.filter(app => {
        const amount = convertCurrency(app.fundingAmount, app.fundingCurrency);
        return amount >= 1000000 && amount < 2500000;
      }).length 
    },
    { 
      range: "₹25L-₹50L", 
      count: applications.filter(app => {
        const amount = convertCurrency(app.fundingAmount, app.fundingCurrency);
        return amount >= 2500000 && amount < 5000000;
      }).length 
    },
    { 
      range: "₹50L-₹1Cr", 
      count: applications.filter(app => {
        const amount = convertCurrency(app.fundingAmount, app.fundingCurrency);
        return amount >= 5000000 && amount < 10000000;
      }).length 
    },
    { 
      range: ">₹1Cr", 
      count: applications.filter(app => {
        const amount = convertCurrency(app.fundingAmount, app.fundingCurrency);
        return amount >= 10000000;
      }).length 
    },
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
            <SelectItem value="USD">US Dollar ($)</SelectItem>
            <SelectItem value="EUR">Euro (€)</SelectItem>
            <SelectItem value="GBP">British Pound (£)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected Startups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{selectedStartups}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Funding Ask</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {selectedCurrency === 'INR' && '₹'}
              {selectedCurrency === 'USD' && '$'}
              {selectedCurrency === 'EUR' && '€'}
              {selectedCurrency === 'GBP' && '£'}
              {averageFundingAsk.toLocaleString(undefined, {
                maximumFractionDigits: 0
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingReviews}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="applications">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="startups">Startups</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Applications</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyApplicationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="applications" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="startups">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Startup by Stage</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Startup by Industry</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="funding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funding Ask Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundingDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
