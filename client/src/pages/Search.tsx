import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search as SearchIcon, 
  Users, 
  Building2, 
  FolderKanban, 
  MapPin, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  X
} from "lucide-react";
import { ConsultantCard, ConsultantCardSkeleton } from "@/components/ConsultantCard";
import { ConsultantDetailModal } from "@/components/ConsultantDetailModal";
import type { Hospital, Project } from "@shared/schema";

interface ConsultantDirectoryItem {
  id: string;
  tngId: string | null;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  location: string | null;
  emrSystems: string[];
  modules: string[];
  yearsExperience: number;
  isAvailable: boolean;
  shiftPreference: string | null;
  averageRating: number | null;
}

interface DirectoryResponse {
  consultants: ConsultantDirectoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  filters: {
    availableEmrSystems: string[];
    availableModules: string[];
  };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function FilterPanelSkeleton() {
  return (
    <Card data-testid="skeleton-filter-panel">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("consultants");
  const [locationFilter, setLocationFilter] = useState("");
  
  const [emrSystemsFilter, setEmrSystemsFilter] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'available' | 'unavailable' | 'all'>('all');
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 30]);
  const [modulesFilter, setModulesFilter] = useState<string[]>([]);
  const [shiftFilter, setShiftFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'location' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const buildQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (availabilityFilter !== 'all') params.append('availability', availabilityFilter);
    if (experienceRange[0] > 0) params.append('experienceMin', experienceRange[0].toString());
    if (experienceRange[1] < 30) params.append('experienceMax', experienceRange[1].toString());
    if (shiftFilter) params.append('shiftPreference', shiftFilter);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('order', sortOrder);
    params.append('page', page.toString());
    params.append('pageSize', '12');
    
    emrSystemsFilter.forEach(emr => params.append('emrSystems[]', emr));
    modulesFilter.forEach(mod => params.append('modules[]', mod));
    
    return params.toString();
  }, [debouncedSearchTerm, emrSystemsFilter, availabilityFilter, experienceRange, modulesFilter, shiftFilter, sortBy, sortOrder, page]);

  const { data: directoryData, isLoading: isLoadingDirectory } = useQuery<DirectoryResponse>({
    queryKey: ['/api/directory/consultants', buildQueryParams],
    queryFn: async () => {
      const res = await fetch(`/api/directory/consultants?${buildQueryParams}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch consultants');
      return res.json();
    },
    enabled: searchType === 'consultants',
  });

  const { data: hospitals, isLoading: isLoadingHospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
    enabled: searchType === 'hospitals',
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: searchType === 'projects',
  });

  const { data: allHospitals } = useQuery<Hospital[]>({
    queryKey: ["/api/hospitals"],
    enabled: searchType === 'projects',
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, emrSystemsFilter, availabilityFilter, experienceRange, modulesFilter, shiftFilter, sortBy, sortOrder]);

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
    return allHospitals?.find((h) => h.id === hospitalId)?.name || "Unknown";
  };

  const handleEmrFilterToggle = (emr: string) => {
    setEmrSystemsFilter(prev => 
      prev.includes(emr) 
        ? prev.filter(e => e !== emr) 
        : [...prev, emr]
    );
  };

  const handleModuleFilterToggle = (mod: string) => {
    setModulesFilter(prev => 
      prev.includes(mod) 
        ? prev.filter(m => m !== mod) 
        : [...prev, mod]
    );
  };

  const clearFilters = () => {
    setEmrSystemsFilter([]);
    setAvailabilityFilter('all');
    setExperienceRange([0, 30]);
    setModulesFilter([]);
    setShiftFilter('');
    setSortBy('name');
    setSortOrder('asc');
    setPage(1);
  };

  const hasActiveFilters = emrSystemsFilter.length > 0 || 
    availabilityFilter !== 'all' || 
    experienceRange[0] > 0 || 
    experienceRange[1] < 30 ||
    modulesFilter.length > 0 || 
    shiftFilter !== '';

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
            {searchType !== 'consultants' && (
              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                data-testid="input-location"
              />
            )}
            {searchType === 'consultants' && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {searchType === "consultants" && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {isLoadingDirectory && !directoryData ? (
            <FilterPanelSkeleton />
          ) : (
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label data-testid="label-availability">Availability</Label>
                  <Select 
                    value={availabilityFilter} 
                    onValueChange={(v) => setAvailabilityFilter(v as 'available' | 'unavailable' | 'all')}
                  >
                    <SelectTrigger data-testid="select-availability">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label data-testid="label-experience">Experience: {experienceRange[0]} - {experienceRange[1]} years</Label>
                  <Slider
                    min={0}
                    max={30}
                    step={1}
                    value={experienceRange}
                    onValueChange={(v) => setExperienceRange(v as [number, number])}
                    data-testid="slider-experience"
                  />
                </div>

                <div className="space-y-3">
                  <Label data-testid="label-shift">Shift Preference</Label>
                  <Select value={shiftFilter} onValueChange={setShiftFilter}>
                    <SelectTrigger data-testid="select-shift">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="swing">Swing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {directoryData?.filters?.availableEmrSystems && directoryData.filters.availableEmrSystems.length > 0 && (
                  <div className="space-y-3">
                    <Label data-testid="label-emr-systems">EMR Systems</Label>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {directoryData.filters.availableEmrSystems.map((emr) => (
                        <div key={emr} className="flex items-center space-x-2">
                          <Checkbox
                            id={`emr-${emr}`}
                            checked={emrSystemsFilter.includes(emr)}
                            onCheckedChange={() => handleEmrFilterToggle(emr)}
                            data-testid={`checkbox-emr-${emr}`}
                          />
                          <label
                            htmlFor={`emr-${emr}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {emr}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {directoryData?.filters?.availableModules && directoryData.filters.availableModules.length > 0 && (
                  <div className="space-y-3">
                    <Label data-testid="label-modules">Modules</Label>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {directoryData.filters.availableModules.map((mod) => (
                        <div key={mod} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mod-${mod}`}
                            checked={modulesFilter.includes(mod)}
                            onCheckedChange={() => handleModuleFilterToggle(mod)}
                            data-testid={`checkbox-module-${mod}`}
                          />
                          <label
                            htmlFor={`mod-${mod}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {mod}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label data-testid="label-sort">Sort By</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'experience' | 'location' | 'rating')}>
                      <SelectTrigger className="flex-1" data-testid="select-sort-by">
                        <SelectValue placeholder="Name" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                      <SelectTrigger className="w-24" data-testid="select-sort-order">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Asc</SelectItem>
                        <SelectItem value="desc">Desc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {isLoadingDirectory && (
              <div className={viewMode === 'grid' ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ConsultantCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            )}

            {!isLoadingDirectory && directoryData && directoryData.consultants.length > 0 && (
              <>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                    Showing {directoryData.consultants.length} of {directoryData.pagination.totalCount} consultants
                  </p>
                  {directoryData.pagination.totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm" data-testid="text-page-info">
                        Page {page} of {directoryData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(directoryData.pagination.totalPages, p + 1))}
                        disabled={page === directoryData.pagination.totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className={viewMode === 'grid' ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
                  {directoryData.consultants.map((consultant) => (
                    <ConsultantCard
                      key={consultant.id}
                      consultant={consultant}
                      viewMode={viewMode}
                      onClick={() => {
                        setSelectedConsultantId(consultant.id);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>

                {directoryData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page-bottom"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm" data-testid="text-page-info-bottom">
                      Page {page} of {directoryData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(directoryData.pagination.totalPages, p + 1))}
                      disabled={page === directoryData.pagination.totalPages}
                      data-testid="button-next-page-bottom"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {!isLoadingDirectory && directoryData && directoryData.consultants.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-no-consultants">No consultants found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" className="mt-4" onClick={clearFilters} data-testid="button-clear-filters-empty">
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {searchType === "hospitals" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingHospitals ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} data-testid={`skeleton-hospital-${i}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-5 w-16" />
                </CardContent>
              </Card>
            ))
          ) : filteredHospitals && filteredHospitals.length > 0 ? (
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
                <h3 className="text-lg font-semibold mb-2" data-testid="text-no-hospitals">No hospitals found</h3>
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
          {isLoadingProjects ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} data-testid={`skeleton-project-${i}`}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-5 w-16" />
                </CardContent>
              </Card>
            ))
          ) : filteredProjects && filteredProjects.length > 0 ? (
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
                <h3 className="text-lg font-semibold mb-2" data-testid="text-no-projects">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ConsultantDetailModal
        consultantId={selectedConsultantId}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setSelectedConsultantId(null);
          }
        }}
      />
    </div>
  );
}
