"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/app/_components/Footer";
// Pie chart removed; using custom BMI bar visualization
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";



function BMIScaleBar({ bmi, bmiCategory }) {
  // BMI scale: 10 (min) to 40 (max)
  const minBMI = 10;
  const maxBMI = 40;
  // Regions
  const regions = [
    { label: 'Underweight', color: '#a3cef1', from: 10, to: 18.5, text: '#277da1' },
    { label: 'Normal', color: '#b6e2a1', from: 18.5, to: 24.9, text: '#43aa8b' },
    { label: 'Overweight', color: '#ffe066', from: 25, to: 29.9, text: '#f9c846' },
    { label: 'Obese', color: '#ff686b', from: 30, to: 40, text: '#d7263d' },
  ];

  return (
    <div className="w-full mt-8 mb-4">
      <div className="relative h-8 w-full rounded-full bg-gray-100 flex items-center shadow-inner">
        {regions.map((region, idx) => {
          const left = ((region.from - minBMI) / (maxBMI - minBMI)) * 100;
          const width = ((region.to - region.from) / (maxBMI - minBMI)) * 100;
          const rounded = idx === 0 ? 'rounded-l-full' : idx === regions.length - 1 ? 'rounded-r-full' : '';
          return (
            <div
              key={region.label}
              className={`absolute top-0 h-8 ${rounded}`}
              style={{ left: `${left}%`, width: `${width}%`, background: region.color, zIndex: 1 }}
            />
          );
        })}
        {/* BMI Indicator */}
        {bmi && (
          <div
            className="absolute top-0 h-8 flex flex-col items-center"
            style={{
              left: `${Math.min(Math.max(((bmi - minBMI) / (maxBMI - minBMI)) * 100, 0), 100)}%`,
              transition: 'left 0.5s',
              zIndex: 10,
            }}
          >
            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-indigo-700 mx-auto" />
            <span className="text-xs font-semibold text-indigo-700 mt-1">{bmi}</span>
          </div>
        )}
      </div>
      {/* Labels */}
      <div className="flex justify-between text-xs mt-2">
        {regions.map((region) => (
          <span key={region.label} className={`font-semibold`} style={{ color: region.text }}>{region.label}</span>
        ))}
      </div>
      {/* BMI Value Marker */}
      {bmi && (
        <div className="text-center mt-2">
          <span className="font-bold text-indigo-700">Your BMI: {bmi} ({bmiCategory})</span>
        </div>
      )}
    </div>
  );
}

const WellnessPlan = () => {
  const [step, setStep] = useState(1);
  const [selectedSex, setSelectedSex] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waistline, setWaistLine] = useState("");
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  const email = path.split("/")[2];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: age,
          height: height,
          weight: weight,
          sex: selectedSex === "male" ? 1 : 0,
          waistline: waistline,
        }),
      });

      const data = await response.json();
      // console.log(data.result);
      setValue(data.result);
      // if (data.result) {
      //   alert(data.result);
      // } else {
      //   alert("Prediction failed");
      // }
    } catch (error) {
      console.log("Prediction failed:", error);
      // alert("Prediction failed, please try again.");
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(
      1
    );
    setBmi(calculatedBmi);
    determineBmiCategory(calculatedBmi);
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



  const handleButtonClick = async () => {
    calculateBMI();
    await handleSubmit();
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-12">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-xl w-full">
          {step === 1 && (
            <>
              <h2 className="mb-6 text-2xl font-semibold text-center">
                Personal Details
              </h2>
              <div className="mb-4">
                <Select onValueChange={(value) => setSelectedSex(value)}>
                  <SelectTrigger className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none bg-white">
                    <SelectValue placeholder="Sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <Input
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  max="120"
                />
              </div>

              <div className="mb-4">
                <Input
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Height (cm)"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="20"
                  max="220"
                />
              </div>

              <div className="mb-4">
                <Input
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Weight (kg)"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="20"
                  max="220"
                />
              </div>

              <div className="mb-4">
                <Input
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Waistline (cm)"
                  type="number"
                  value={waistline}
                  onChange={(e) => setWaistLine(e.target.value)}
                  min="10"
                  max="220"
                />
              </div>

              <div className="flex justify-center mt-6">
                <Button onClick={handleButtonClick} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin mr-2" /> Loading...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  onClick={() => setStep(1)}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-2xl font-semibold text-center flex-1">
                  Your BMI Report
                </h2>
              </div>
              <div className="text-center mb-4">
                <p>
                  Your BMI: <strong>{bmi}</strong>
                </p>
                <p>
                  Category: <strong>{bmiCategory}</strong>
                </p>
              </div>
              {/* BMI Bar Visualization */}
              <BMIScaleBar bmi={bmi} bmiCategory={bmiCategory} />
              <div className="flex justify-center mt-6">
                {value !== "The person is healthy. Cheers to good health" ? (
                  <Button
                    onClick={() =>
                      router.replace(`/dashboard/${email}/personalisedplan`)
                    }
                  >
                    Get Personalized Plan
                  </Button>
                ) : (
                  ""
                )}
              </div>

              <div className="mt-8">
                <h2 className="text-center text-2xl">{value}</h2>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WellnessPlan;
