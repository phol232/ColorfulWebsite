import React from "react";
import { Link } from "wouter";

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <a className="flex items-center">
        <span className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-2">
          F
        </span>
        <span className="text-xl font-bold">
          foodi<span className="text-primary">slice</span>
        </span>
      </a>
    </Link>
  );
};

export default Logo;
