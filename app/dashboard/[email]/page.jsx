import React from "react";
import Sidebar from "../_components/Sidebar";
import ProfileNavbar from "../_components/ProfileNavbar";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

const daily = [
  { src: "/sleeping.png", title: "Sleep", desc: "8 hrs last night" },
  { src: "/feet.png", title: "Steps", desc: "4619 Steps" },
  { src: "/food.png", title: "Food", desc: "150 kCal" },
  { src: "/heart.png", title: "Heart", desc: "120/60 BPM" },
];

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <section className="w-[77vw] absolute left-[23vw]">
        <ProfileNavbar />
        <main className="px-10 py-8 w-[77vw] h-screen">
          <div>
            <h1 className="text-4xl font-semibold">Hey, John Doe</h1>
            <h3 className="text-md font-light text-slate-500">
              Here is your daily activity and reports
            </h3>
          </div>

          <div className="daily-tasks my-10 w-full h-1/5">
            <h1 className="text-3xl tracking-tighter">Daily Task</h1>
            <div className="flex w-full h-full gap-6 my-4 justify-between items-center">
              {daily.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="card flex gap-6 items-center justify-around px-10 py-12 w-1/4 h-full rounded-2xl bg-white/70"
                  >
                    <div>
                      <Image src={item.src} alt="" width={40} height={40} />{" "}
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold">{item.title}</h1>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="big-cards flex gap-4 mt-20 w-full h-1/3">
            <div className="w-1/4 h-full bg-white/70 rounded-2xl">
              <div className="flex flex-col justify-center items-center gap-4 px-10 py-4">
                <h1 className="text-2xl font-semibold">{daily[0].title}</h1>
                <h3 className="text-lg">{daily[0].desc}</h3>
                <div className="graph"></div>
              </div>
            </div>
            <div className="w-1/2 h-full bg-white/70 rounded-2xl px-10 py-4">
              <h1 className="text-xl font-semibold">Fitness Acitivity</h1>
            </div>
            <div className="w-1/4 h-full bg-white/70 rounded-2xl px-10 py-4 flex flex-col items-center justify-start">
              <div className="rounded-full overflow-hidden">
                <Image src={"/user.png"} alt="profile" width={80} height={80} />
              </div>
              <h1 className="text-2xl font-semibold mt-4">John Doe</h1>
              <h3 className="text-sm  font-light ">Fitness Trainer</h3>
            </div>
          </div>

          <div className="last-block flex w-full gap-4 h-1/5 mt-5 rounded-2xl">
            <div className="1 bg-white/70 w-1/4 h-full rounded-2xl">
              <div className="flex w-full flex-col gap-4 items-center justify-center py-2 px-8">
                <div className="flex w-full gap-6 items-center justify-start">
                  <Image
                    src={"/metabolism.png"}
                    alt="sleep"
                    width={40}
                    height={40}
                  />

                  <div className="flex flex-col justify-center items-center">
                    <h1 className="text-xl font-semibold">Fat Burning</h1>
                    <h3 className="text-md font-thin text-slate-500">
                      Progress <span className="text-blue-400">65%</span>
                    </h3>
                  </div>
                </div>

                <div className="flex w-full gap-6 items-center justify-start">
                  <Image
                    src={daily[0].src}
                    alt="sleep"
                    width={40}
                    height={40}
                  />

                  <div className="flex flex-col justify-center items-center">
                    <h1 className="text-xl font-semibold"> Sleeping</h1>
                    <h1 className="text-md font-thin text-slate-500">
                      Progress <span className="text-blue-400">65%</span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 w-1/4 h-full py-2 px-8 rounded-2xl flex flex-col">
              <div className="flex items-center justify-start gap-6">
                <Image src={"/cycling.png"} alt="" width={40} height={40} />

                <div className="flex flex-col justify-center items-start">
                  <h1 className="text-xl font-semibold">Cycling</h1>
                  <h1 className="text-sm font-extralight">24km / week</h1>
                </div>
              </div>

              <div className="flex flex-col gap-2 my-4 justify-center items-start">
                <h3 className="text-xs text-slate-600">Progress</h3>
                <Progress value={28} />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-600">24 / 30 km</p>
                <div className="w-20 h-6 rounded-2xl justify-center items-center flex text-xs bg-green-200 border-green-400 text-green-600">
                  1 Day Left
                </div>
              </div>
            </div>

            <div className="3 bg-white/70 w-1/4 h-full rounded-2xl "></div>
            <div className="4 bg-white/70 w-1/4 h-full rounded-2xl "></div>
          </div>
        </main>
        {/* <Footer /> */}
      </section>
    </div>
  );
};

export default Dashboard;
