"use client";

import { FC, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AddButtonProps {
  label: string;             // Button text
  href?: string;             // Optional link
  onClick?: () => void;      // Optional click handler
  icon?: ReactNode;          // Optional icon (default is plus)
  className?: string;        // Extra classes for styling
}

const AddButton: FC<AddButtonProps> = ({
  label,
  href,
  onClick,
  icon,
  className = "",
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center gap-1 rounded-[15px] border border-gray-300
        bg-[#2f3e46] text-gray-300 hover:bg-gray-500 hover:cursor-pointer
        transition-colors duration-200 px-4 py-2
        ${className}
      `}
    >
      {/* Default plus icon if no custom icon is passed */}
      {icon ?? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )}
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default AddButton;