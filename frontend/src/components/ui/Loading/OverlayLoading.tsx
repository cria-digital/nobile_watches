import { FC } from "react";
import { Loading } from "./Loading";

interface OverlayLoadingProps {
  text?: string;
}

export const OverlayLoading: FC<OverlayLoadingProps> = ({ text }) => {
  return <Loading size="md" {...(text ? { text } : {})} fullScreen />;
};
