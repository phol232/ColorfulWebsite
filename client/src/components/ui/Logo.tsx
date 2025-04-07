import React from "react";
import { Link } from "wouter";

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <Link href="/">
        <div className="flex items-center cursor-pointer">
          <span className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-2">
            F
          </span>
          <span className="text-xl font-bold">
            foodi<span className="text-primary">slice</span>
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Logo;
