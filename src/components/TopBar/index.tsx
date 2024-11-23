import { useState } from "react";


const TopBar = () => {
  const [time, setTime] = useState("00:00");

  const updateTime = () => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    setTime(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    );
  };

  setInterval(() => {
    updateTime();
  }, 1000);

  return (
    <header
      className="w-screen h-10 absolute top-2"
      style={{
        zIndex: 6,
      }}
    >
      <div className="flex justify-between items-center h-full">
        <div className="flex flex-row items-center">
          <div className="w-32 h-10 items-center align-middle justify-center text-center flex">
           
          </div>
         
        </div>
        {/* right side */}
        <div className="flex flex-row items-center pr-2">
          <div className="w-24 h-10 backdrop-blur-sm rounded-xl bg-[#C22DC2]/50 border border-[#C22DC2]">
            <div className="flex items-center justify-center w-full h-full text-center align-middle">
              <span className="inter text-white text-center">{time}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
