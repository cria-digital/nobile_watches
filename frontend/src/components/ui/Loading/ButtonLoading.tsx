import { FC } from "react";

export const ButtonLoading: FC = () => {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
};
