import React from "react";
import Sidebar from "../_components/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <section>
        <main>
          <div></div>
          <div></div>
        </main>
        {/* <Footer /> */}
      </section>
    </div>
  );
};

export default Dashboard;
