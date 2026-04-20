import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", width = 200, height = 60 }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Salva AI Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo;
