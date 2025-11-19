import { Lato } from "next/font/google";
import localFont from "next/font/local";

export const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
  preload: true,
});

export const erstoria = localFont({
  src: "../../../public/fonts/erstoria.otf",
  variable: "--font-erstoria",
  display: "swap",
  preload: true,
});

export const fontVariables = `${lato.variable} ${erstoria.variable}`;
