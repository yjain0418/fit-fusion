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
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend);

const WellnessPlan = () => {
  const [step, setStep] = useState(1);
  const [selectedSex, setSelectedSex] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const router = useRouter();
  const path = usePathname();

  const email = path.split("/")[2];

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    const calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(
      1
    );
    setBmi(calculatedBmi);
    determineBmiCategory(calculatedBmi);
    setStep(2);
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

  const pieChartData = {
    labels: ["Underweight", "Normal", "Overweight", "Obese"],
    datasets: [
      {
        data: [
          bmiCategory === "Underweight" ? 1 : 0,
          bmiCategory === "Normal" ? 1 : 0,
          bmiCategory === "Overweight" ? 1 : 0,
          bmiCategory === "Obese" ? 1 : 0,
        ],
        backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        enabled: true,
      },
    },
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

              <div className="flex justify-center mt-6">
                <Button onClick={calculateBMI}>Submit</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6">
                Your BMI Report
              </h2>
              <div className="text-center mb-4">
                <p>
                  Your BMI: <strong>{bmi}</strong>
                </p>
                <p>
                  Category: <strong>{bmiCategory}</strong>
                </p>
              </div>
              <Pie data={pieChartData} options={pieChartOptions} />{" "}
              {/* Render the pie chart */}
              <div className="flex justify-center mt-6">
                {bmiCategory !== "Normal" ? (
                  <Button
                    onClick={() =>
                      router.replace(`/dashboard/${email}/personalisedplan`)
                    }
                  >
                    Get Prescription
                  </Button>
                ) : (
                  ""
                )}

                {}
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
