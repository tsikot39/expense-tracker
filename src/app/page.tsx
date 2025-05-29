import { ExpenseSummary } from "@/components/expense-summary";
import { ExpenseList } from "@/components/expense-list";
import { CategoryDistributionChart } from "@/components/charts/category-distribution-chart";
import { ExpenseTrendsChart } from "@/components/charts/expense-trends-chart";
import { MonthlyComparisonChart } from "@/components/charts/monthly-comparison-chart";
import { LineChart, ClockIcon } from "lucide-react";
import { 
  getFirstDayOfPreviousMonth, 
  getLastDayOfPreviousMonth,
  getFirstDayOfCurrentYear,
  getLastDayOfCurrentYear
} from "@/lib/utils";

export default function Home() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col space-y-2">
        {/*<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">*/}
        {/*  Dashboard*/}
        {/*</h1>*/}
        <p className="text-muted-foreground">
          Track and manage your expenses with real-time analytics and insights.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <ExpenseSummary title="This Month" period="current-month" />
        <ExpenseSummary 
          title="Last Month" 
          period="custom" 
          startDate={getFirstDayOfPreviousMonth()} 
          endDate={getLastDayOfPreviousMonth()} 
        />
        <ExpenseSummary 
          title="This Year" 
          period="custom" 
          startDate={getFirstDayOfCurrentYear()} 
          endDate={getLastDayOfCurrentYear()} 
        />
        <ExpenseSummary title="All Time" period="all-time" />
      </div>

      {/* Charts Section */}
      <div className="pt-2">
        <div className="flex items-center mb-6">
          <LineChart className="h-6 w-6 text-primary mr-3" />
          <h2 className="text-2xl font-semibold">Analytics</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CategoryDistributionChart period="current-month" />
          <ExpenseTrendsChart period="current-month" />
          <MonthlyComparisonChart months={6} />
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="pt-2">
        <div className="flex items-center mb-6">
          <ClockIcon className="h-6 w-6 text-primary mr-3" />
          <h2 className="text-2xl font-semibold">Recent Expenses</h2>
        </div>
        <ExpenseList limit={10} showPagination={true} />
      </div>
    </div>
  );
}
