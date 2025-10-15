"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ArrowLeft, Heart, Scale, Ruler, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Footer from "@/app/_components/Footer";
import Sidebar from "../../_components/Sidebar";

// BMIScaleBar Component (same as before)
const BMIScaleBar = ({ bmi, bmiCategory }) => {
  const regions = [
    { label: 'Underweight', color: 'bg-blue-400', from: 10, to: 18.5, textColor: 'text-blue-700' },
    { label: 'Normal', color: 'bg-green-400', from: 18.5, to: 24.9, textColor: 'text-green-700' },
    { label: 'Overweight', color: 'bg-yellow-400', from: 25, to: 29.9, textColor: 'text-yellow-700' },
    { label: 'Obese', color: 'bg-red-400', from: 30, to: 40, textColor: 'text-red-700' },
  ];

  const minBMI = 10;
  const maxBMI = 40;
  const bmiPosition = Math.min(Math.max(((bmi - minBMI) / (maxBMI - minBMI)) * 100, 0), 100);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Your BMI Result</h3>
          <p className="text-lg text-gray-600">
            <span className="font-semibold text-indigo-600">{bmi}</span> - {bmiCategory}
          </p>
        </div>

        <div className="relative mb-8">
          <div className="flex h-8 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            {regions.map((region, idx) => {
              const left = ((region.from - minBMI) / (maxBMI - minBMI)) * 100;
              const width = ((region.to - region.from) / (maxBMI - minBMI)) * 100;
              const rounded = idx === 0 ? 'rounded-l-full' : idx === regions.length - 1 ? 'rounded-r-full' : '';
              return (
                <div
                  key={region.label}
                  className={`absolute top-0 h-8 ${region.color} ${rounded}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
            
            <div
              className="absolute top-0 -ml-2 flex flex-col items-center transition-all duration-500"
              style={{ left: `${bmiPosition}%` }}
            >
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-8 border-b-indigo-700" />
              <div className="mt-2 px-2 py-1 bg-indigo-700 text-white text-xs font-bold rounded">
                {bmi}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-10 text-sm font-semibold">
            {regions.map((region) => (
              <span key={region.label} className={region.textColor}>
                {region.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {regions.map((region) => (
            <div key={region.label} className="flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full ${region.color} mr-2`} />
              <span className="text-xs text-gray-600">{region.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// PersonalDetailsForm Component (same as before)
const PersonalDetailsForm = ({ formData, onUpdate, onSubmit, loading }) => {
  const { sex, age, height, weight, waistline } = formData;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-gray-900">
          BMI Calculator
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Enter your details to calculate your Body Mass Index
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sex" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Sex
            </Label>
            <Select value={sex} onValueChange={(value) => onUpdate('sex', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-medium">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => onUpdate('age', e.target.value)}
              min="0"
              max="120"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="Enter height in cm"
              value={height}
              onChange={(e) => onUpdate('height', e.target.value)}
              min="20"
              max="220"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(e) => onUpdate('weight', e.target.value)}
              min="20"
              max="220"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waistline" className="text-sm font-medium flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Waistline (cm)
          </Label>
          <Input
            id="waistline"
            type="number"
            placeholder="Enter waistline in cm"
            value={waistline}
            onChange={(e) => onUpdate('waistline', e.target.value)}
            min="10"
            max="220"
            className="w-full"
          />
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={onSubmit} 
            disabled={loading || !sex || !age || !height || !weight || !waistline}
            size="lg"
            className="min-w-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 w-4 h-4" />
                Calculating...
              </>
            ) : (
              'Calculate BMI'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ResultsView Component (same as before)
const ResultsView = ({ bmi, bmiCategory, healthStatus, onBack, onGetPlan, email, router }) => {
  const isHealthy = healthStatus === "The person is healthy. Cheers to good health";

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card>
        <CardContent className="">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Your Health Report
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Complete analysis of your BMI and health status
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>

      <BMIScaleBar bmi={bmi} bmiCategory={bmiCategory} />

      <Card className={`border-l-4 ${isHealthy ? 'border-l-green-500' : 'border-l-orange-500'}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Health Assessment
            </h3>
            <p className={`text-lg ${isHealthy ? 'text-green-600' : 'text-orange-600'} font-medium`}>
              {healthStatus}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 sm:flex-none"
        >
          Recalculate BMI
        </Button>
        
        {!isHealthy && (
          <Button 
            onClick={() => router.replace(`/dashboard/${email}/personalisedplan`)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Get Personalized Plan
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Health Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Maintain a balanced diet with plenty of fruits and vegetables</p>
            <p>• Engage in regular physical activity (30 minutes daily)</p>
            <p>• Stay hydrated and get adequate sleep</p>
            <p>• Monitor your progress regularly</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main WellnessPlan Component with proper footer
const WellnessPlan = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sex: "",
    age: "",
    height: "",
    weight: "",
    waistline: ""
  });
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  
  const router = useRouter();
  const path = usePathname();
  const email = path.split("/")[2];

  const handleUpdate = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateBMI = () => {
    const { height, weight } = formData;
    const heightInMeters = height / 100;
    const calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(calculatedBmi);
    determineBmiCategory(calculatedBmi);
    return calculatedBmi;
  };

  const determineBmiCategory = (bmi) => {
    if (bmi < 18.5) {
      setBmiCategory("Underweight");
    } else if (bmi >= 18.5 && bmi < 24.9) {
      setBmiCategory("Normal");
    } else if (bmi >= 25 && bmi < 29.9) {
      setBmiCategory("Overweight");
    } else {
      setBmiCategory("Obese");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      calculateBMI();
      
      const response = await fetch("/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: formData.age,
          height: formData.height,
          weight: formData.weight,
          sex: formData.sex === "male" ? 1 : 0,
          waistline: formData.waistline,
        }),
      });

      const data = await response.json();
      setHealthStatus(data.result);
    } catch (error) {
      console.error("Prediction failed:", error);
      setHealthStatus("Unable to generate health assessment. Please try again.");
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setHealthStatus("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <section className="flex-1 lg:ml-64">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-center items-center min-h-[70vh] py-8">
              {step === 1 && (
                <PersonalDetailsForm
                  formData={formData}
                  onUpdate={handleUpdate}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}
              
              {step === 2 && (
                <ResultsView
                  bmi={bmi}
                  bmiCategory={bmiCategory}
                  healthStatus={healthStatus}
                  onBack={handleBack}
                  email={email}
                  router={router}
                />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer - Now properly positioned at the bottom */}
      <Footer />
    </div>
  );
};

export default WellnessPlan;