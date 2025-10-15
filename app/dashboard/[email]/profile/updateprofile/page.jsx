"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/app/_components/Footer";

// Personal Information Section Component
const PersonalInfoSection = ({ formData, onUpdate }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          type="text"
          id="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <Label htmlFor="age" className="text-sm font-medium">
          Age
        </Label>
        <Input
          type="number"
          id="age"
          placeholder="Enter your age"
          value={formData.age}
          onChange={(e) => onUpdate("age", e.target.value)}
          className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="gender" className="text-sm font-medium">
          Gender
        </Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => onUpdate("gender", value)}
        >
          <SelectTrigger className="bg-white mt-1 focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="prefer_not_to_say">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-medium">
          Phone Number
        </Label>
        <Input
          type="tel"
          id="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(e) => onUpdate("phone", e.target.value)}
          className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

// Physical Information Section Component
const PhysicalInfoSection = ({ formData, onUpdate }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="height" className="text-sm font-medium">
          Height (cm)
        </Label>
        <Input
          type="number"
          id="height"
          placeholder="Enter your height"
          value={formData.height}
          onChange={(e) => onUpdate("height", e.target.value)}
          className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <Label htmlFor="weight" className="text-sm font-medium">
          Weight (kg)
        </Label>
        <Input
          type="number"
          id="weight"
          placeholder="Enter your weight"
          value={formData.weight}
          onChange={(e) => onUpdate("weight", e.target.value)}
          className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="address" className="text-sm font-medium">
        Address
      </Label>
      <Input
        type="text"
        id="address"
        placeholder="Enter your complete address"
        value={formData.address}
        onChange={(e) => onUpdate("address", e.target.value)}
        className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
);

// Professional Information Section Component
const ProfessionalInfoSection = ({ formData, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <Label className="text-sm font-medium mb-3 block">User Type</Label>
      <RadioGroup
        value={formData.userType}
        onValueChange={(value) => onUpdate("userType", value)}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border-gray-200">
          <RadioGroupItem value="general" id="general" />
          <Label
            htmlFor="general"
            className="cursor-pointer font-normal"
          >
            General User
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border-gray-200">
          <RadioGroupItem value="trainer" id="trainer" />
          <Label
            htmlFor="trainer"
            className="cursor-pointer font-normal"
          >
            Trainer/Practitioner/Doctor
          </Label>
        </div>
      </RadioGroup>
    </div>

    {formData.userType === "trainer" && (
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900">Professional Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="designation" className="text-sm font-medium">
              Designation
            </Label>
            <Input
              type="text"
              id="designation"
              placeholder="Enter your designation"
              value={formData.designation}
              onChange={(e) => onUpdate("designation", e.target.value)}
              className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <Label htmlFor="experience" className="text-sm font-medium">
              Experience (years)
            </Label>
            <Input
              type="number"
              id="experience"
              placeholder="Enter years of experience"
              value={formData.experience}
              onChange={(e) => onUpdate("experience", e.target.value)}
              className="bg-white mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    )}
  </div>
);

// Profile Photo Section Component
const ProfilePhotoSection = ({ formData, onUpdate }) => (
  <div className="mb-6 flex flex-col items-center">
    <Label className="text-sm font-medium mb-2">Profile Photo</Label>
    <div className="mb-2">
      {formData.profilePhoto ? (
        <img
          src={formData.profilePhoto}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          No Photo
        </div>
      )}
    </div>
    <Input
      type="file"
      accept="image/*"
      onChange={(e) => onUpdate("profilePhotoFile", e.target.files[0])}
      className="w-48"
    />
  </div>
);

// Main Update Profile Component
const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    email: "",
    address: "",
    phone: "",
    coins: 0,
    reward: "",
    designation: "",
    experience: "",
    userType: "general",
    profilePhoto: "",
    profilePhotoFile: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUpdate = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let photoUrl = formData.profilePhoto;

    // Handle photo upload if a new file is selected
    if (formData.profilePhotoFile) {
      const photoData = new FormData();
      photoData.append("file", formData.profilePhotoFile);

      // Replace with your actual upload endpoint
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: photoData,
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        photoUrl = url;
      }
    }

    const submitData = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender,
      height: Number(formData.height),
      weight: Number(formData.weight),
      address: formData.address,
      coins: formData.coins,
      reward: formData.reward,
      phone: formData.phone,
      userType: formData.userType,
      designation: formData.userType === "trainer" ? formData.designation : "",
      experience: formData.userType === "trainer" ? Number(formData.experience) : 0,
      profilePhoto: photoUrl,
    };

    try {
      const result = await fetch(`/api/profile/${formData.email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (result.ok) {
        alert("Profile updated successfully");
        router.replace(`/dashboard/${formData.email}/profile`);
      } else {
        alert("Profile update failed");
      }
    } catch (error) {
      alert("An error occurred while updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Update Your Profile
            </h1>
            <p className="text-lg text-gray-600">
              Keep your information up to date
            </p>
          </div>

          {/* Main Card Container */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6">
              <CardTitle className="text-2xl font-bold">
                Profile Information
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Fill in your details to update your profile
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <Tabs defaultValue="personal" className="space-y-6">
                {/* Profile Photo Section */}
                <ProfilePhotoSection formData={formData} onUpdate={handleUpdate} />

                {/* Tab Navigation */}
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all"
                  >
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="physical"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all"
                  >
                    Physical Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all"
                  >
                    Professional Info
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info Tab */}
                  <TabsContent
                    value="personal"
                    className="space-y-4 animate-in fade-in-50"
                  >
                    <PersonalInfoSection formData={formData} onUpdate={handleUpdate} />
                  </TabsContent>

                  {/* Physical Info Tab */}
                  <TabsContent
                    value="physical"
                    className="space-y-4 animate-in fade-in-50"
                  >
                    <PhysicalInfoSection formData={formData} onUpdate={handleUpdate} />
                  </TabsContent>

                  {/* Professional Info Tab */}
                  <TabsContent
                    value="professional"
                    className="space-y-4 animate-in fade-in-50"
                  >
                    <ProfessionalInfoSection formData={formData} onUpdate={handleUpdate} />
                  </TabsContent>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6 border-t border-gray-200">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating Profile...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateProfile;