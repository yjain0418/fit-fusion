"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useParams } from "next/navigation";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

// Dynamically import react-markdown to avoid SSR issues
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

const PersonalisedPlan = () => {
  const params = useParams();
  const path = usePathname();
  const router = useRouter();
  const email = params?.email || path.split("/")[2];

  // Form state
  const [formData, setFormData] = useState({
    sex: "",
    age: "",
    height: "",
    weight: "",
    waistline: "",
    speciallyAbled: "",
    medicalConditions: [],
    lifestyle: [],
    diet: [],
    familyHistory: [],
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  // Fetch profile data on mount
  React.useEffect(() => {
    if (!email) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${email}`);
        if (res.ok) {
          const data = await res.json();
          if (data.result) {
            setFormData(prev => ({
              ...prev,
              age: data.result.age ? String(data.result.age) : "",
              height: data.result.height ? String(data.result.height) : "",
              weight: data.result.weight ? String(data.result.weight) : "",
              sex: (data.result.gender || "").toLowerCase() === "male" ? "male" :
                   (data.result.gender || "").toLowerCase() === "female" ? "female" : ""
            }));
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, [email]);

  // Options
  const medicalConditions = [
    "Heart Disease", "Diabetes", "Hypertension", "Asthma", "Allergies", "Chronic Pain", "Arthritis", "Depression", "Anxiety", "None", "Migraine", "Thyroid Disorder", "NA",
  ];
  const lifestyleOptions = [
    "Active", "Sedentary", "Balanced", "Stressed", "Healthy", "Busy", "Relaxed", "Moderate Exercise", "High-Intensity Exercise", "Workaholic",
  ];
  const dietOptions = [
    "Balanced Diet", "High-Protein", "Vegetarian", "Vegan", "Keto", "Low-Carb", "High-Carb", "Intermittent Fasting", "Junk Food", "Organic Only", "Gluten-Free", "Pescatarian", "Low-Sugar", "Fast Food Regular", "Mixed Diet",
  ];
  const familyHistoryOptions = [
    "Heart Disease", "Diabetes", "Cancer", "Hypertension", "Alzheimer's Disease", "Stroke", "Mental Illness", "Autoimmune Disorder", "Genetic Disorder", "None", "Asthma", "Arthritis", "Blood Disorders", "Obesity", "Kidney Disease", "Osteoporosis", "Thyroid Disorder",
  ];
  const speciallyAbledOptions = ["Yes", "No", "Partial", "Prefer not to say"];

  // Handlers
  const handleUpdate = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSelection = (item, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const getResult = async () => {
    const prompt = `I am ${formData.age} years old, weigh ${formData.weight} kg, and am ${formData.height} cm tall. I have the following existing conditions: ${formData.medicalConditions}. My lifestyle is ${formData.lifestyle}. My diet primarily consists of: ${formData.diet}. I have a family history of the following illnesses: ${formData.familyHistory}. Specially abled: ${formData.speciallyAbled}. Please provide a concise health risk assessment, including any potential risks based on my profile. Then, list clear and distinct health measures I can take to mitigate these risks. Please assess my health risks and suggest possible health measures to prevent future health hazards. Also suggest any potential diet and lifestyle changes in a different section. Avoid repetition and ensure each recommendation is unique. Summarize your suggestions briefly at the end.`;
    setLoading(true);
    setOutput("");
    setShowOutput(false);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.output) {
        setOutput(data.output.trim());
        setShowOutput(true);
      } else {
        setOutput("Error: " + (data.error || "Unknown error"));
        setShowOutput(true);
      }
    } catch (error) {
      setOutput("Error generating content. Please try again.");
      setShowOutput(true);
    } finally {
      setLoading(false);
    }
  };

  // UI Steps
  const steps = [
    (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Personalised Health Plan
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Enter your details for a tailored health plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sex" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Sex
              </Label>
              <Select value={formData.sex} onValueChange={v => handleUpdate('sex', v)}>
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
                value={formData.age}
                onChange={e => handleUpdate('age', e.target.value)}
                min="0"
                max="120"
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="Enter height in cm"
                value={formData.height}
                onChange={e => handleUpdate('height', e.target.value)}
                min="20"
                max="220"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter weight in kg"
                value={formData.weight}
                onChange={e => handleUpdate('weight', e.target.value)}
                min="20"
                max="220"
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waistline" className="text-sm font-medium">Waistline (cm)</Label>
            <Input
              id="waistline"
              type="number"
              placeholder="Enter waistline in cm"
              value={formData.waistline}
              onChange={e => handleUpdate('waistline', e.target.value)}
              min="10"
              max="220"
              className="w-full"
            />
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleNext}
              disabled={!formData.sex || !formData.age || !formData.height || !formData.weight || !formData.waistline}
              size="lg"
              className="min-w-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    ),
    (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Existing Medical Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {medicalConditions.map((condition, idx) => (
              <Button
                key={idx}
                className={`w-full text-left px-4 py-2 border rounded-xl ${
                  formData.medicalConditions.includes(condition)
                    ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                    : "bg-white border-gray-300 text-black hover:bg-white hover:text-black"
                }`}
                onClick={() => toggleSelection(condition, "medicalConditions")}
              >
                {condition}
              </Button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    ),
    (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Lifestyle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {lifestyleOptions.map((option, idx) => (
              <Button
                key={idx}
                className={`w-full text-left px-4 py-2 border rounded-xl ${
                  formData.lifestyle.includes(option)
                    ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                    : "bg-white border-gray-300 text-black hover:bg-white hover:text-black"
                }`}
                onClick={() => toggleSelection(option, "lifestyle")}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    ),
    (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Current Diet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {dietOptions.map((option, idx) => (
              <Button
                key={idx}
                className={`w-full text-left px-4 py-2 border rounded-xl ${
                  formData.diet.includes(option)
                    ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                    : "bg-white border-gray-300 text-black hover:bg-white hover:text-black"
                }`}
                onClick={() => toggleSelection(option, "diet")}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    ),
    (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Family History of Medical Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {familyHistoryOptions.map((option, idx) => (
              <Button
                key={idx}
                className={`w-full text-left px-4 py-2 border rounded-xl ${
                  formData.familyHistory.includes(option)
                    ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                    : "bg-white border-gray-300 text-black hover:bg-white hover:text-black"
                }`}
                onClick={() => toggleSelection(option, "familyHistory")}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button onClick={handleBack}>Back</Button>
            <Button onClick={handleNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    ),
    (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Specially Abled Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mb-4">
            {speciallyAbledOptions.map((option, idx) => (
              <Button
                key={idx}
                className={`w-full text-left px-4 py-2 border rounded-xl ${
                  formData.speciallyAbled === option
                    ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                    : "bg-white border-gray-300 text-black hover:bg-white hover:text-black"
                }`}
                onClick={() => handleUpdate("speciallyAbled", option)}
              >
                {option}
              </Button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button onClick={handleBack}>Back</Button>
            <Button
              onClick={getResult}
              disabled={loading}
              className="min-w-40 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  Generating...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    ),
  ];

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
              {steps[step - 1]}
            </div>
          </div>
        </section>
      </div>
      {/* Output Modal */}
      {showOutput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white max-w-2xl w-full mx-4 p-8 rounded-xl shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={() => setShowOutput(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-center text-indigo-700">Personalised Plan</h3>
            <div className="overflow-y-auto max-h-[60vh]">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h2 className="mt-6 mb-2 text-xl font-bold text-indigo-600" {...props} />,
                  h2: ({node, ...props}) => <h3 className="mt-4 mb-2 text-lg font-semibold text-blue-700" {...props} />,
                  h3: ({node, ...props}) => <h4 className="mt-2 mb-1 text-base font-semibold text-blue-600" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-gray-800" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-gray-800" {...props} />,
                  li: ({node, ...props}) => <li className="mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-indigo-700" {...props} />,
                  em: ({node, ...props}) => <em className="text-orange-700" {...props} />,
                  hr: () => <hr className="my-4 border-gray-300" />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-gray-600 my-4" {...props} />
                  ),
                  // Add more custom styles as needed
                }}
              >
                {output}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PersonalisedPlan;
