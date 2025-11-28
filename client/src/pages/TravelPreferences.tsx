import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plane,
  Hotel,
  Car,
  Utensils,
  Phone,
  User,
  Save,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import type { TravelPreference, Consultant } from "@shared/schema";

const AIRLINES = [
  "American Airlines",
  "Delta Air Lines",
  "United Airlines",
  "Southwest Airlines",
  "JetBlue Airways",
  "Alaska Airlines",
  "Spirit Airlines",
  "Frontier Airlines",
  "Hawaiian Airlines",
  "Allegiant Air",
];

const SEAT_PREFERENCES = [
  { value: "window", label: "Window" },
  { value: "middle", label: "Middle" },
  { value: "aisle", label: "Aisle" },
];

const VEHICLE_SIZES = [
  { value: "economy", label: "Economy" },
  { value: "compact", label: "Compact" },
  { value: "midsize", label: "Midsize" },
  { value: "fullsize", label: "Full Size" },
  { value: "suv", label: "SUV" },
  { value: "luxury", label: "Luxury" },
];

const RENTAL_CAR_COMPANIES = [
  "Enterprise",
  "Hertz",
  "Avis",
  "Budget",
  "National",
  "Alamo",
  "Dollar",
  "Thrifty",
  "Sixt",
  "Fox Rent A Car",
];

const HOTEL_CHAINS = [
  "Marriott",
  "Hilton",
  "Hyatt",
  "IHG",
  "Wyndham",
  "Best Western",
  "Choice Hotels",
  "Radisson",
  "Accor",
  "Four Seasons",
];

const MEAL_PREFERENCES = [
  "No Preference",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Kosher",
  "Halal",
  "Dairy-Free",
  "Nut-Free",
  "Low Sodium",
  "Diabetic",
];

const travelPreferencesFormSchema = z.object({
  consultantId: z.string().min(1, "Consultant is required"),
  preferredAirlines: z.array(z.string()).optional(),
  seatPreference: z.enum(["window", "middle", "aisle"]).nullable().optional(),
  rentalCarPreference: z.enum(["economy", "compact", "midsize", "fullsize", "suv", "luxury"]).nullable().optional(),
  rentalCarCompany: z.string().nullable().optional(),
  rentalCarRewardsNumber: z.string().nullable().optional(),
  mealPreference: z.string().nullable().optional(),
  specialRequests: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  emergencyContactRelation: z.string().nullable().optional(),
  travelNotes: z.string().nullable().optional(),
});

type TravelPreferencesFormValues = z.infer<typeof travelPreferencesFormSchema>;

interface ConsultantWithUser extends Consultant {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export default function TravelPreferences() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null);

  const { data: consultants, isLoading: isLoadingConsultants } = useQuery<ConsultantWithUser[]>({
    queryKey: ["/api/consultants"],
    enabled: isAdmin,
  });

  const { data: currentConsultant, isLoading: isLoadingCurrentConsultant } = useQuery<ConsultantWithUser>({
    queryKey: ["/api/consultants/user", user?.id],
    enabled: !!user?.id && !isAdmin,
  });

  const consultantId = isAdmin ? selectedConsultantId : currentConsultant?.id;

  const { data: travelPrefs, isLoading: isLoadingPrefs } = useQuery<TravelPreference>({
    queryKey: ["/api/travel-preferences", consultantId],
    enabled: !!consultantId,
  });

  const { data: consultantDetails } = useQuery<ConsultantWithUser>({
    queryKey: ["/api/consultants", consultantId],
    enabled: !!consultantId,
  });

  const form = useForm<TravelPreferencesFormValues>({
    resolver: zodResolver(travelPreferencesFormSchema),
    defaultValues: {
      consultantId: "",
      preferredAirlines: [],
      seatPreference: null,
      rentalCarPreference: null,
      rentalCarCompany: null,
      rentalCarRewardsNumber: null,
      mealPreference: null,
      specialRequests: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactRelation: null,
      travelNotes: null,
    },
  });

  useEffect(() => {
    if (consultantId) {
      form.setValue("consultantId", consultantId);
    }
  }, [consultantId, form]);

  useEffect(() => {
    if (travelPrefs) {
      form.reset({
        consultantId: travelPrefs.consultantId,
        preferredAirlines: travelPrefs.preferredAirlines || [],
        seatPreference: travelPrefs.seatPreference as "window" | "middle" | "aisle" | null,
        rentalCarPreference: travelPrefs.rentalCarPreference as "economy" | "compact" | "midsize" | "fullsize" | "suv" | "luxury" | null,
        rentalCarCompany: travelPrefs.rentalCarCompany,
        rentalCarRewardsNumber: travelPrefs.rentalCarRewardsNumber,
        mealPreference: travelPrefs.mealPreference,
        specialRequests: travelPrefs.specialRequests,
        emergencyContactName: travelPrefs.emergencyContactName,
        emergencyContactPhone: travelPrefs.emergencyContactPhone,
        emergencyContactRelation: travelPrefs.emergencyContactRelation,
        travelNotes: travelPrefs.travelNotes,
      });
    } else if (consultantId) {
      form.reset({
        consultantId: consultantId,
        preferredAirlines: [],
        seatPreference: null,
        rentalCarPreference: null,
        rentalCarCompany: null,
        rentalCarRewardsNumber: null,
        mealPreference: null,
        specialRequests: null,
        emergencyContactName: null,
        emergencyContactPhone: null,
        emergencyContactRelation: null,
        travelNotes: null,
      });
    }
  }, [travelPrefs, consultantId, form]);

  const upsertMutation = useMutation({
    mutationFn: async (data: TravelPreferencesFormValues) => {
      const response = await apiRequest("PUT", "/api/travel-preferences", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel-preferences", consultantId] });
      toast({
        title: "Success",
        description: "Travel preferences saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save travel preferences",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TravelPreferencesFormValues) => {
    upsertMutation.mutate(data);
  };

  const isLoading = isLoadingConsultants || isLoadingCurrentConsultant || isLoadingPrefs;

  if (!isAdmin && isLoadingCurrentConsultant) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Travel Preferences</h1>
        <p className="text-muted-foreground">
          Manage travel preferences for airline, hotel, and rental car bookings
        </p>
      </div>

      {isAdmin && (
        <Card data-testid="card-consultant-selector">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Consultant
            </CardTitle>
            <CardDescription>
              Choose a consultant to view and edit their travel preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConsultants ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedConsultantId || ""}
                onValueChange={(value) => setSelectedConsultantId(value)}
                data-testid="select-consultant"
              >
                <SelectTrigger data-testid="select-consultant-trigger">
                  <SelectValue placeholder="Select a consultant..." />
                </SelectTrigger>
                <SelectContent>
                  {consultants?.map((consultant) => (
                    <SelectItem
                      key={consultant.id}
                      value={consultant.id}
                      data-testid={`select-consultant-option-${consultant.id}`}
                    >
                      {consultant.user?.firstName} {consultant.user?.lastName}
                      {consultant.tngId && ` (${consultant.tngId})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
      )}

      {!consultantId && !isAdmin && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p>Unable to load your consultant profile. Please contact support.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && !selectedConsultantId && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-5 w-5" />
              <p>Please select a consultant to view and edit their travel preferences.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {consultantId && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card data-testid="card-airline-preferences">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Airline Preferences
                </CardTitle>
                <CardDescription>
                  Set your preferred airlines, seat preferences, and rewards information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPrefs ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="preferredAirlines"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Airlines</FormLabel>
                          <FormDescription>Select all airlines you prefer to fly with</FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                            {AIRLINES.map((airline) => (
                              <div key={airline} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`airline-${airline}`}
                                  checked={field.value?.includes(airline)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, airline]);
                                    } else {
                                      field.onChange(currentValue.filter((a) => a !== airline));
                                    }
                                  }}
                                  data-testid={`checkbox-airline-${airline.toLowerCase().replace(/\s+/g, "-")}`}
                                />
                                <Label
                                  htmlFor={`airline-${airline}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {airline}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="seatPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seat Preference</FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={(value) => field.onChange(value || null)}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-seat-preference">
                                  <SelectValue placeholder="Select seat preference..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SEAT_PREFERENCES.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Airline Rewards Number</Label>
                        <Input
                          value={consultantDetails?.flightRewardsNumber || ""}
                          disabled
                          placeholder="Set in consultant profile"
                          data-testid="input-airline-rewards-number"
                        />
                        <p className="text-xs text-muted-foreground">
                          This is managed in your consultant profile
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-hotel-preferences">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Hotel Preferences
                </CardTitle>
                <CardDescription>
                  Set your preferred hotel chains and rewards information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPrefs ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preferred Hotel Chain</Label>
                      <Input
                        value={consultantDetails?.hotelPreference || ""}
                        disabled
                        placeholder="Set in consultant profile"
                        data-testid="input-hotel-preference"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is managed in your consultant profile
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Hotel Rewards Number</Label>
                      <Input
                        value={consultantDetails?.hotelRewardsNumber || ""}
                        disabled
                        placeholder="Set in consultant profile"
                        data-testid="input-hotel-rewards-number"
                      />
                      <p className="text-xs text-muted-foreground">
                        This is managed in your consultant profile
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-rental-car-preferences">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Rental Car Preferences
                </CardTitle>
                <CardDescription>
                  Set your rental car company, vehicle size, and rewards information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPrefs ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rentalCarCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Company</FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={(value) => field.onChange(value || null)}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-rental-car-company">
                                  <SelectValue placeholder="Select rental company..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RENTAL_CAR_COMPANIES.map((company) => (
                                  <SelectItem key={company} value={company}>
                                    {company}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rentalCarPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Size</FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={(value) => field.onChange(value || null)}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-vehicle-size">
                                  <SelectValue placeholder="Select vehicle size..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {VEHICLE_SIZES.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="rentalCarRewardsNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rental Car Rewards Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Enter your rental car rewards number"
                              data-testid="input-rental-car-rewards"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-meal-preferences">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Meal Preference & Special Requests
                </CardTitle>
                <CardDescription>
                  Set dietary requirements and any special travel accommodations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPrefs ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="mealPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meal Preference</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={(value) => field.onChange(value || null)}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-meal-preference">
                                <SelectValue placeholder="Select meal preference..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MEAL_PREFERENCES.map((preference) => (
                                <SelectItem key={preference} value={preference}>
                                  {preference}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              placeholder="Enter any special travel accommodations or requests..."
                              className="min-h-[100px]"
                              data-testid="textarea-special-requests"
                            />
                          </FormControl>
                          <FormDescription>
                            Include accessibility needs, mobility requirements, or other accommodations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-emergency-contact">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
                <CardDescription>
                  Provide emergency contact information for travel purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingPrefs ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Full name"
                              data-testid="input-emergency-contact-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="(555) 555-5555"
                              data-testid="input-emergency-contact-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactRelation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="e.g., Spouse, Parent, Sibling"
                              data-testid="input-emergency-contact-relation"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-travel-notes">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Travel Notes
                </CardTitle>
                <CardDescription>
                  Any additional notes or preferences for travel coordinators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPrefs ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <FormField
                    control={form.control}
                    name="travelNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Add any additional notes about your travel preferences..."
                            className="min-h-[100px]"
                            data-testid="textarea-travel-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={upsertMutation.isPending || isLoadingPrefs}
                data-testid="button-save-preferences"
              >
                {upsertMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
