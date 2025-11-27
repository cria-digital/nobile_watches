import Image from "next/image";

export default function AuthWatchCard() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl bg-[#EFEFEF] p-6 shadow-sm">
      <div className="relative flex-shrink-0">
        <div className="w-[80px] h-[80px]">
          <Image
            src="/images/product/watchtime-logo.svg"
            alt="Watch Time Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
      </div>

      <h3
        className="font-lato font-semibold text-pb-500"
        style={{
          fontSize: "18px",
          lineHeight: "140%",
          letterSpacing: "-0.01em",
        }}
      >
        Sua compra com laudo de autenticidade Watch time!
      </h3>

      <p
        className="text-sm text-gray-400"
        style={{
          lineHeight: "148%",
        }}
      >
        Enviamos os seus relógios até uma central para verificar a autenticidade com o
        custo adicional de <span className="font-bold text-gray-400">R$3.430,00.</span>
      </p>
    </div>
  );
}
