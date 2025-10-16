"use client";

import Card from "../../_components/Card";
import ProfileNavbar from "../../_components/ProfileNavbar";
import Sidebar from "../../_components/Sidebar";
import SearchBar from "../../_components/Searchbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 8;

const Coaches = () => {
  const [designation, setDesignation] = useState("");
  const [page, setPage] = useState(1);
  const [coaches, setCoaches] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchCoaches = async (page, designation) => {
    try {
      const result = await fetch(`/api/coaches?page=${page}&search=${designation}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (result.ok) {
        const res = await result.json();
        setCoaches(res.data);
        setHasNextPage(res.hasNextPage);
      } else {
        console.error("Error occurred while fetching coaches");
      }
    } catch (error) {
      console.error("Error occurred: " + error);
    }
  };

  // Fetch coaches data whenever the page or designation changes
  useEffect(() => {
    fetchCoaches(page, designation);
  }, [page, designation]);

  // Handle Select value change
  const handleDesignationChange = (value) => {
    setDesignation(value);
    setPage(1); // Reset page to 1 when designation changes
  };

  // Handle Next button click
  const handleNext = () => {
    if (hasNextPage) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Handle Previous button click
  const handlePrevious = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <>
      <div className="flex">
        <Sidebar className="fixed" />
        <section className="w-[75vw] px-12 py-4 absolute left-[23vw]">
          <div className="w-3/4">
            <div className="flex justify-between items-center w-full h-16">
              <div className="w-1/2 h-full flex items-center justify-center">
                <Select onValueChange={handleDesignationChange}>
                  <SelectTrigger className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none bg-white">
                    <SelectValue placeholder="Designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trainer">Trainers</SelectItem>
                    <SelectItem value="Doctor">Doctors</SelectItem>
                    <SelectItem value="Nutritionist">Nutritionists</SelectItem>
                    <SelectItem value="Psychiatrist">Psychiatrists</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <SearchBar />
            </div>

            <ProfileNavbar />
          </div>
          <main className="w-full h-11/12 px-12 py-10">
            <div className="heading text-4xl font-semibold mb-4">
              {designation === "" ? "Nutritionist and Coaches" : designation}
            </div>
            <div className="flex flex-wrap gap-12 py-8">
              {coaches.map((item, index) => (
                <Card key={index} user={item} />
              ))}
            </div>
            {/* Pagination Buttons */}
            <div className="flex justify-center mt-8">
              <button
                className={`px-4 py-2 mx-2 border rounded ${
                  page === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
                }`}
                onClick={handlePrevious}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                className={`px-4 py-2 mx-2 border rounded ${
                  hasNextPage ? "bg-blue-500 text-white" : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={handleNext}
                disabled={!hasNextPage}
              >
                Next
              </button>
            </div>
          </main>
        </section>
      </div>
    </>
  );
};

export default Coaches;