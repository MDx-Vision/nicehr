import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, MapPin, Star, CheckCircle, XCircle, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Consultant, User } from "@shared/schema";

interface ConsultantWithUser extends Consultant {
  user?: User;
}

export default function Consultants() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");
  const [shiftFilter, setShiftFilter] = useState<string>("");

  const { data: consultants, isLoading } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
  });

  const filteredConsultants = consultants?.filter((consultant) => {
    const matchesSearch = !searchTerm || 
      consultant.tngId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      consultant.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesAvailability = !availabilityFilter || 
      (availabilityFilter === "available" ? consultant.isAvailable : !consultant.isAvailable);
    
    const matchesShift = !shiftFilter || consultant.shiftPreference === shiftFilter;

    return matchesSearch && matchesLocation && matchesAvailability && matchesShift;
  });

  const getInitials = (consultant: Consultant) => {
    return consultant.tngId?.substring(0, 2) || "C";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-consultants-title">Consultants</h1>
          <p className="text-muted-foreground">View and manage consultant profiles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-consultants"
              />
            </div>
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              data-testid="input-filter-location"
            />
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger data-testid="select-availability">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger data-testid="select-shift">
                <SelectValue placeholder="Shift Preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="swing">Swing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredConsultants && filteredConsultants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConsultants.map((consultant) => (
            <Card key={consultant.id} className="hover-elevate" data-testid={`card-consultant-${consultant.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(consultant)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{consultant.tngId}</CardTitle>
                      <CardDescription>
                        {consultant.yearsExperience || 0} years experience
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={consultant.isAvailable ? "default" : "secondary"}>
                      {consultant.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    {consultant.isOnboarded ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Onboarded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {consultant.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{consultant.location}</span>
                  </div>
                )}

                {consultant.shiftPreference && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Shift: </span>
                    <Badge variant="outline" className="capitalize">
                      {consultant.shiftPreference}
                    </Badge>
                  </div>
                )}

                {consultant.emrSystems && consultant.emrSystems.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">EMR Systems:</p>
                    <div className="flex flex-wrap gap-1">
                      {consultant.emrSystems.slice(0, 3).map((system, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {system}
                        </Badge>
                      ))}
                      {consultant.emrSystems.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{consultant.emrSystems.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {consultant.modules && consultant.modules.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Modules:</p>
                    <div className="flex flex-wrap gap-1">
                      {consultant.modules.slice(0, 3).map((module, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                      {consultant.modules.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{consultant.modules.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {consultant.payRate && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Pay Rate: </span>
                    <span className="font-medium">${consultant.payRate}/hr</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
            <p className="text-muted-foreground">
              {searchTerm || locationFilter || availabilityFilter || shiftFilter
                ? "Try adjusting your filters"
                : "Consultants will appear here once they register"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
