"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Apple, 
  Flame, 
  Target,
  TrendingUp,
  ChefHat,
  Search,
  Clock,
  Utensils
} from "lucide-react";

const DietRecommendation = () => {
  const params = useParams();
  const email = params?.email;
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [customSearch, setCustomSearch] = useState("");
  const [customResults, setCustomResults] = useState([]);
  
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activityLevel: "moderate",
    goal: "maintain",
    dietType: "balanced"
  });

  useEffect(() => {
    fetchProfile();
  }, [email]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${email}`);
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setProfile(data.result);
          setFormData(prev => ({
            ...prev,
            age: data.result.age ? String(data.result.age) : "",
            weight: data.result.weight ? String(data.result.weight) : "",
            height: data.result.height ? String(data.result.height) : "",
            gender: (data.result.gender || "").toLowerCase()
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diet/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearch = async () => {
    if (!customSearch.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/diet/custom-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: customSearch,
          ...formData 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCustomResults(data.results);
      }
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Sidebar />
      
      <section className="flex-1 ml-64">
        <ProfileNavbar />
        
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <ChefHat className="w-10 h-10 text-green-600" />
              Diet Recommendation System
            </h1>
            <p className="text-gray-600">
              Get personalized meal recommendations based on your health profile
            </p>
          </div>

          <Tabs defaultValue="recommendations" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="recommendations">Get Recommendations</TabsTrigger>
              <TabsTrigger value="custom">Custom Search</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Health Profile</CardTitle>
                  <CardDescription>
                    Fill in your details to get personalized diet recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age (years)</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Enter your age"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="Enter your weight"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="Enter your height"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="activityLevel">Activity Level</Label>
                      <Select 
                        value={formData.activityLevel} 
                        onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="light">Light Activity</SelectItem>
                          <SelectItem value="moderate">Moderate Activity</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="goal">Health Goal</Label>
                      <Select 
                        value={formData.goal} 
                        onValueChange={(value) => setFormData({ ...formData, goal: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose">Weight Loss</SelectItem>
                          <SelectItem value="maintain">Maintain Weight</SelectItem>
                          <SelectItem value="gain">Weight Gain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dietType">Diet Preference</Label>
                      <Select 
                        value={formData.dietType} 
                        onValueChange={(value) => setFormData({ ...formData, dietType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="low_carb">Low Carb</SelectItem>
                          <SelectItem value="high_protein">High Protein</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleGetRecommendations}
                    disabled={loading || !formData.age || !formData.weight || !formData.height}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Recommendations...
                      </>
                    ) : (
                      "Get Diet Recommendations"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Personalized Diet Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecommendationsDisplay recommendations={recommendations} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Food Search</CardTitle>
                  <CardDescription>
                    Search for specific foods and get nutritional information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={customSearch}
                      onChange={(e) => setCustomSearch(e.target.value)}
                      placeholder="Search for foods (e.g., chicken, rice, apple)"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomSearch()}
                    />
                    <Button onClick={handleCustomSearch} disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {customResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {customResults.map((food, index) => (
                        <FoodCard key={index} food={food} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </section>
    </div>
  );
};

const RecommendationsDisplay = ({ recommendations }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Calories</p>
                <p className="text-2xl font-bold text-orange-600">
                  {recommendations.dailyCalories || "--"}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Protein (g)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {recommendations.protein || "--"}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Carbs (g)</p>
                <p className="text-2xl font-bold text-green-600">
                  {recommendations.carbs || "--"}
                </p>
              </div>
              <Apple className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fat (g)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {recommendations.fat || "--"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">BMI</p>
            <p className="text-xl font-bold text-blue-600">{recommendations.bmi}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">BMR</p>
            <p className="text-xl font-bold text-purple-600">{recommendations.bmr}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-pink-50">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">TDEE</p>
            <p className="text-xl font-bold text-pink-600">{recommendations.tdee}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Recommended Meals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.meals?.map((meal, index) => (
            <MealCard key={index} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
};

const MealCard = ({ meal }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-10 h-10 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">{meal.name}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Calories:</span>
                <Badge variant="secondary">{meal.calories} kcal</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Protein:</span>
                <Badge variant="secondary">{meal.protein}g</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carbs:</span>
                <Badge variant="secondary">{meal.carbs}g</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fat:</span>
                <Badge variant="secondary">{meal.fat}g</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FoodCard = ({ food }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-3">
            <Apple className="w-16 h-16 text-orange-600" />
          </div>
          <h4 className="font-semibold">{food.name}</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Calories</p>
              <p className="font-semibold">{food.calories}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Protein</p>
              <p className="font-semibold">{food.protein}g</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Carbs</p>
              <p className="font-semibold">{food.carbs}g</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Fat</p>
              <p className="font-semibold">{food.fat}g</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DietRecommendation;
