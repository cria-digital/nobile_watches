import { FC } from "react";
import { Loading } from "./Loading";

interface PageLoadingProps {
  text?: string;
}

export const PageLoading: FC<PageLoadingProps> = ({ text = "Carregando..." }) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      <style jsx>{`
        @media (min-width: 1024px) {
          div {
            min-height: calc(100vh - 96px);
          }
        }
      `}</style>
      <Loading size="lg" text={text} />
    </div>
  );
};
