import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, DollarSign, Users, Plane, Hotel, Utensils, TrendingDown, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Project, BudgetCalculation, Hospital } from "@shared/schema";

export default function BudgetCalculator() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  
  const [formData, setFormData] = useState({
    estimatedConsultants: 0,
    optimizedConsultants: 0,
    avgPayRate: "75",
    avgFlightCost: "500",
    avgHotelCost: "150",
    avgPerDiem: "75",
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: existingBudget, isLoading: budgetLoading } = useQuery<BudgetCalculation>({
    queryKey: ["/api/projects", selectedProject, "budget"],
    enabled: !!selectedProject,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/projects/${selectedProject}/budget`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject, "budget"] });
      toast({ title: "Budget calculation saved" });
    },
    onError: () => {
      toast({ title: "Failed to save budget", variant: "destructive" });
    },
  });

  const getHospitalName = (hospitalId: string) => {
    return hospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  const selectedProjectData = projects?.find((p) => p.id === selectedProject);

  const calculateBudget = () => {
    const est = formData.estimatedConsultants;
    const opt = formData.optimizedConsultants;
    const payRate = parseFloat(formData.avgPayRate) || 0;
    const flightCost = parseFloat(formData.avgFlightCost) || 0;
    const hotelCost = parseFloat(formData.avgHotelCost) || 0;
    const perDiem = parseFloat(formData.avgPerDiem) || 0;

    const projectDays = selectedProjectData
      ? Math.ceil((new Date(selectedProjectData.endDate).getTime() - new Date(selectedProjectData.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 14;

    const hoursPerDay = 10;
    const totalHours = projectDays * hoursPerDay;

    const laborCostPerConsultant = payRate * totalHours;
    const travelCostPerConsultant = flightCost + (hotelCost * projectDays) + (perDiem * projectDays);
    const totalCostPerConsultant = laborCostPerConsultant + travelCostPerConsultant;

    const totalEstimated = est * totalCostPerConsultant;
    const totalOptimized = opt * totalCostPerConsultant;
    const totalSavings = totalEstimated - totalOptimized;
    const savingsPercentage = est > 0 ? ((est - opt) / est) * 100 : 0;

    return {
      totalEstimated,
      totalOptimized,
      totalSavings,
      savingsPercentage,
      projectDays,
    };
  };

  const handleSave = () => {
    const calc = calculateBudget();
    saveMutation.mutate({
      estimatedConsultants: formData.estimatedConsultants,
      optimizedConsultants: formData.optimizedConsultants,
      avgPayRate: formData.avgPayRate,
      avgFlightCost: formData.avgFlightCost,
      avgHotelCost: formData.avgHotelCost,
      avgPerDiem: formData.avgPerDiem,
      totalEstimatedCost: calc.totalEstimated.toString(),
      totalOptimizedCost: calc.totalOptimized.toString(),
      totalSavings: calc.totalSavings.toString(),
      savingsPercentage: calc.savingsPercentage.toString(),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculations = calculateBudget();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-budget-title">Budget Calculator</h1>
        <p className="text-muted-foreground">
          Calculate and optimize consultant costs for projects
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[300px]" data-testid="select-project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} - {getHospitalName(project.hospitalId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProject ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
            <p className="text-muted-foreground">
              Choose a project to calculate and optimize its budget.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Input Parameters
              </CardTitle>
              <CardDescription>
                Enter the estimated and optimized consultant numbers along with cost parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimated">Estimated Consultants</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="estimated"
                      type="number"
                      className="pl-10"
                      value={formData.estimatedConsultants}
                      onChange={(e) => setFormData({ ...formData, estimatedConsultants: parseInt(e.target.value) || 0 })}
                      data-testid="input-estimated"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hospital's initial estimate
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optimized">Optimized Consultants</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="optimized"
                      type="number"
                      className="pl-10"
                      value={formData.optimizedConsultants}
                      onChange={(e) => setFormData({ ...formData, optimizedConsultants: parseInt(e.target.value) || 0 })}
                      data-testid="input-optimized"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    NICEHR recommended count
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Avg Pay Rate ($/hr)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="payRate"
                      type="number"
                      className="pl-10"
                      value={formData.avgPayRate}
                      onChange={(e) => setFormData({ ...formData, avgPayRate: e.target.value })}
                      data-testid="input-pay-rate"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flight">Avg Flight Cost ($)</Label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="flight"
                      type="number"
                      className="pl-10"
                      value={formData.avgFlightCost}
                      onChange={(e) => setFormData({ ...formData, avgFlightCost: e.target.value })}
                      data-testid="input-flight"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel">Avg Hotel Cost ($/night)</Label>
                  <div className="relative">
                    <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="hotel"
                      type="number"
                      className="pl-10"
                      value={formData.avgHotelCost}
                      onChange={(e) => setFormData({ ...formData, avgHotelCost: e.target.value })}
                      data-testid="input-hotel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perDiem">Avg Per Diem ($/day)</Label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="perDiem"
                      type="number"
                      className="pl-10"
                      value={formData.avgPerDiem}
                      onChange={(e) => setFormData({ ...formData, avgPerDiem: e.target.value })}
                      data-testid="input-perdiem"
                    />
                  </div>
                </div>
              </div>

              {isAdmin && (
                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-budget"
                >
                  Save Calculation
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Cost Analysis
                </CardTitle>
                <CardDescription>
                  Project duration: {calculations.projectDays} days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-1">Estimated Total Cost</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-estimated-cost">
                        {formatCurrency(calculations.totalEstimated)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formData.estimatedConsultants} consultants
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-1">Optimized Total Cost</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-optimized-cost">
                        {formatCurrency(calculations.totalOptimized)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formData.optimizedConsultants} consultants
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">Total Savings</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300" data-testid="text-savings">
                      {formatCurrency(calculations.totalSavings)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">Savings</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300" data-testid="text-savings-percent">
                      {calculations.savingsPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  By optimizing consultant allocation, you save{" "}
                  {formData.estimatedConsultants - formData.optimizedConsultants} consultants
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Breakdown per Consultant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor ({calculations.projectDays * 10} hours)</span>
                    <span>{formatCurrency(parseFloat(formData.avgPayRate) * calculations.projectDays * 10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flight (round trip)</span>
                    <span>{formatCurrency(parseFloat(formData.avgFlightCost))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hotel ({calculations.projectDays} nights)</span>
                    <span>{formatCurrency(parseFloat(formData.avgHotelCost) * calculations.projectDays)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Diem ({calculations.projectDays} days)</span>
                    <span>{formatCurrency(parseFloat(formData.avgPerDiem) * calculations.projectDays)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total per Consultant</span>
                    <span>
                      {formatCurrency(
                        (parseFloat(formData.avgPayRate) * calculations.projectDays * 10) +
                        parseFloat(formData.avgFlightCost) +
                        (parseFloat(formData.avgHotelCost) * calculations.projectDays) +
                        (parseFloat(formData.avgPerDiem) * calculations.projectDays)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
