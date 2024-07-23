import React from "react";
import Image from "next/image";

const Navbar = () => {
  return (
    <div
      style={{
        // width: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "40px",
        padding: "20px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div>
        <Image
          src="/Assent.svg"
          alt="Company logo"
          width={200} // Set your desired width
          height={51} // Set your desired height
        />
      </div>
    </div>
  );
};

export default Navbar;
