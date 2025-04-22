import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

interface FinancialSummaryProps {
  budget?: {
    total: number;
    paid: number;
  };
}

export default function FinancialSummary({ budget }: FinancialSummaryProps) {
  // Use default values if budget is not provided
  const totalBudget = budget?.total || 15000;
  const paidAmount = budget?.paid || 9450;
  const remainingBudget = totalBudget - paidAmount;
  const percentPaid = Math.round((paidAmount / totalBudget) * 100);

  // Mock data for budget distribution
  // In a real application, this would come from API
  const budgetDistribution = [
    { name: "Marketing", amount: 4200, color: "bg-success-500" },
    { name: "Development", amount: 3750, color: "bg-primary-500" },
    { name: "Design", amount: 1500, color: "bg-warning-500" },
  ];
  
  return (
    <Card className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-lg text-neutral-800">Financial Summary</h2>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-md">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-neutral-50 p-3 rounded-lg">
            <h3 className="text-sm text-neutral-500 mb-1">Total Budget</h3>
            <p className="text-xl font-bold text-neutral-800">${totalBudget.toLocaleString()}</p>
          </div>
          
          <div className="bg-neutral-50 p-3 rounded-lg">
            <h3 className="text-sm text-neutral-500 mb-1">Amount Paid</h3>
            <p className="text-xl font-bold text-success-500">${paidAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-neutral-50 p-3 rounded-lg mb-4">
          <h3 className="text-sm text-neutral-500 mb-1">Remaining Budget</h3>
          <p className="text-xl font-bold text-primary-500">${remainingBudget.toLocaleString()}</p>
          <div className="w-full h-2 bg-neutral-200 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-primary-500" 
              style={{ width: `${100 - percentPaid}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {budgetDistribution.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${item.color} mr-2`}></div>
                <span className="text-neutral-700">{item.name}</span>
              </div>
              <span className="font-medium text-neutral-800">${item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
