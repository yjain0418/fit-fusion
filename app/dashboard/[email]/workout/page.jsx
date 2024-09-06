"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../_components/Sidebar";
import ProfileNavbar from "../../_components/ProfileNavbar";
import { usePathname, useRouter } from "next/navigation";
import { fetchExercises } from "@/app/api/exercise/route";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Volume2 } from "lucide-react";

const Workout = () => {
  const router = useRouter();
  const email = usePathname().split("/")[2];
  const [exercises, setExercises] = useState([]);
  const [bodyPart, setBodyPart] = useState("chest");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const getExercises = async () => {
      if (!bodyPart) return;

      try {
        const data = await fetchExercises(bodyPart);
        setExercises(data || []);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }
    };

    getExercises();
  }, [bodyPart]);

  const handleCardClick = (exercise) => {
    setSelectedExercise(exercise);
    setOpenDialog(true);
  };

  const textToSpeech = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.7;
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text-to-speech!");
    }
  };

  const speakInstructionsWithDelay = (instructions) => {
    instructions.forEach((instruction, index) => {
      setTimeout(() => {
        textToSpeech(instruction);
      }, index * 3000);
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    window.speechSynthesis.cancel();
  };

  return (
    <>
      <div className="flex">
        <Sidebar />
        <section className="p-10 w-[77vw] absolute left-[23vw] h-screen overflow-x-hidden">
          <ProfileNavbar />
          <main>
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-4">
                Workout Plan for John Doe
              </h1>

              {/* Select Body Part */}
              <div className="mb-4">
                <label className="mr-2 font-lg">Select Body Part:</label>
                <Select
                  value={bodyPart}
                  onValueChange={(value) => setBodyPart(value)}
                >
                  <SelectTrigger className="bg-white border p-2 w-48">
                    <SelectValue placeholder="Select Body Part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chest">Chest</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="legs">Legs</SelectItem>
                    <SelectItem value="lower legs">Lower Legs</SelectItem>
                    <SelectItem value="upper legs">Upper Legs</SelectItem>
                    <SelectItem value="arms">Arms</SelectItem>
                    <SelectItem value="lower arms">Lower Arms</SelectItem>
                    <SelectItem value="upper arms">Upper Arms</SelectItem>
                    <SelectItem value="neck">Neck</SelectItem>
                    <SelectItem value="shoulders">Shoulders</SelectItem>
                    <SelectItem value="waist">Waist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Display fetched exercises in a grid format */}
              {exercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-4 bg-gray-100 rounded-md shadow-md cursor-pointer"
                      onClick={() => handleCardClick(exercise)}
                    >
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-full h-48 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/path/to/fallback-image.jpg";
                        }}
                      />
                      <h3 className="font-semibold text-lg mt-2">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Target Muscle: {exercise.target}
                      </p>
                      <p className="text-sm text-gray-600">
                        Equipment: {exercise.equipment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No exercises found for {bodyPart}.</p>
              )}
            </div>
          </main>
          {/* <Footer /> */}
        </section>
      </div>

      {/* Dialog for Exercise Details */}
      {selectedExercise && (
        <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedExercise.name}</DialogTitle>
              <DialogDescription>
                <img
                  src={selectedExercise.gifUrl}
                  alt={selectedExercise.name}
                  className="w-full h-48 object-cover rounded mb-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/path/to/fallback-image.jpg";
                  }}
                />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      Target Muscle: {selectedExercise.target}
                    </p>
                    <p className="text-sm text-gray-600">
                      Equipment: {selectedExercise.equipment}
                    </p>
                  </div>

                  <div className="mr-4">
                    <Volume2
                      className="cursor-pointer"
                      onClick={() =>
                        speakInstructionsWithDelay(
                          selectedExercise.instructions || []
                        )
                      }
                    />
                  </div>
                </div>

                {/* Instructions */}
                <ul className="mt-4 list-disc pl-5 space-y-2">
                  {selectedExercise.instructions?.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-800">
                      {instruction}
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Workout;
