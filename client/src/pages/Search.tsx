import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search as SearchIcon, Users, Building2, FolderKanban, MapPin, Filter } from "lucide-react";
import type { Consultant, Hospital, Project } from "@shared/schema";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("consultants");
  const [locationFilter, setLocationFilter] = useState("");

  const { data: consultants } = useQuery<Consultant[]>({
    queryKey: ["/api/consultants"],
  });

  const { data: hospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredConsultants = consultants?.filter((c) => {
    const matchesSearch = !searchTerm ||
      c.tngId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.emrSystems?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !locationFilter ||
      c.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const filteredHospitals = hospitals?.filter((h) => {
    const matchesSearch = !searchTerm ||
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.emrSystem?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter ||
      h.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      h.state?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const filteredProjects = projects?.filter((p) => {
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getHospitalName = (hospitalId: string) => {
    return hospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-search-title">Search</h1>
        <p className="text-muted-foreground">
          Find consultants, hospitals, and projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger data-testid="select-type">
                <SelectValue placeholder="Search Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultants">Consultants</SelectItem>
                <SelectItem value="hospitals">Hospitals</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              data-testid="input-location"
            />
          </div>
        </CardContent>
      </Card>

      {searchType === "consultants" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConsultants && filteredConsultants.length > 0 ? (
            filteredConsultants.map((consultant) => (
              <Card key={consultant.id} className="hover-elevate" data-testid={`card-consultant-${consultant.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{consultant.tngId?.slice(0, 2) || "C"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{consultant.tngId}</CardTitle>
                      <CardDescription>
                        {consultant.yearsExperience || 0} years experience
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {consultant.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{consultant.location}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={consultant.isAvailable ? "default" : "secondary"}>
                      {consultant.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    {consultant.shiftPreference && (
                      <Badge variant="outline" className="capitalize">
                        {consultant.shiftPreference}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-10 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {searchType === "hospitals" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHospitals && filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="hover-elevate" data-testid={`card-hospital-${hospital.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-base">{hospital.name}</CardTitle>
                      {hospital.emrSystem && (
                        <CardDescription>EMR: {hospital.emrSystem}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {(hospital.city || hospital.state) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{[hospital.city, hospital.state].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  <Badge variant={hospital.isActive ? "default" : "secondary"}>
                    {hospital.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-10 text-center">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hospitals found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {searchType === "projects" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects && filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                <CardHeader>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {getHospitalName(project.hospitalId)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <Badge className="capitalize">{project.status}</Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-10 text-center">
                <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
