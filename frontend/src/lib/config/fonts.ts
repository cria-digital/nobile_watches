import { Lato } from "next/font/google";
import localFont from "next/font/local";

export const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
  preload: true,
});

export const erstoria = localFont({
  src: [
    {
      path: "../../../public/fonts/erstoria.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-erstoria",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

export const fontVariables = `${lato.variable} ${erstoria.variable}`;
