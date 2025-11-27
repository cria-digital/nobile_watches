import { FC } from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const Loading: FC<LoadingProps> = ({ size = "md", text, fullScreen = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-5">
      {/* Elegant triple ring spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring - slow rotation */}
        <div
          className={`absolute inset-0 border-[1.5px] border-gray-200/40 rounded-full`}
          style={{
            animation: "spin 3s linear infinite",
            borderTopColor: "#1a1a1a",
            borderRightColor: "transparent",
          }}
        />

        {/* Middle ring - medium rotation */}
        <div
          className={`absolute border-[1.5px] border-transparent rounded-full`}
          style={{
            animation: "spin 2s linear infinite reverse",
            borderTopColor: "#4a4a4a",
            borderLeftColor: "transparent",
            top: "4px",
            left: "4px",
            right: "4px",
            bottom: "4px",
          }}
        />

        {/* Inner ring - fast rotation */}
        <div
          className={`absolute border-[1.5px] border-transparent rounded-full`}
          style={{
            animation: "spin 1.5s linear infinite",
            borderTopColor: "#2a2a2a",
            borderBottomColor: "transparent",
            top: "8px",
            left: "8px",
            right: "8px",
            bottom: "8px",
          }}
        />
      </div>

      {text && (
        <p className={`${textSizeClasses[size]} text-[#2a2a2a] font-light tracking-wide`}>
          {text}
        </p>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
