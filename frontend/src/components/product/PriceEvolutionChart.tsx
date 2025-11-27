"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PriceDataPoint {
  date: string;
  value: number;
}

interface PriceEvolutionChartProps {
  data: PriceDataPoint[];
  currentPrice: number;
  change: number;
  percentChange: number;
}

type TimeFilter = "max" | "6m" | "3m" | "1m";

export function PriceEvolutionChart({
  data,
  currentPrice,
  change,
  percentChange,
}: PriceEvolutionChartProps) {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>("max");

  // Filtra os dados baseado no período selecionado
  const getFilteredData = () => {
    const now = new Date();
    const filterMap: Record<TimeFilter, number> = {
      "1m": 1,
      "3m": 3,
      "6m": 6,
      max: data.length,
    };

    const monthsToShow = filterMap[selectedFilter];
    if (selectedFilter === "max") {
      return data;
    }

    return data.slice(-monthsToShow);
  };

  const filteredData = getFilteredData();

  const formatValue = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  // Componente customizado para o Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-lato text-sm text-gray-600 mb-1">
            {payload[0].payload.date}
          </p>
          <p className="font-erstoria text-base font-medium text-[#141414]">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const filters: { value: TimeFilter; label: string }[] = [
    { value: "max", label: "Máx." },
    { value: "6m", label: "6 mês." },
    { value: "3m", label: "3 mês." },
    { value: "1m", label: "1 mês." },
  ];

  // Calcula min e max para o eixo Y com margem
  const values = filteredData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const margin = (maxValue - minValue) * 0.1;
  const yAxisMin = Math.floor(minValue - margin);
  const yAxisMax = Math.ceil(maxValue + margin);

  return (
    <div>
      {/* Indicadores de valor e data */}
      <div className="h-[44px] flex items-center justify-between bg-[#EFEFEF] rounded-[8px] px-3 mb-[22px]">
        <span className="font-lato text-sm text-pb-500 tracking-[-0.01em]">
          Desde 24/02/2025
        </span>
        <div className="h-[28px] flex items-center gap-1.5">
          <span className="h-[28px] flex items-center text-sm font-medium text-white tracking-[-0.01em] bg-[#17A83D] px-3 rounded">
            +{formatValue(change)}
          </span>
          <span className="h-[28px] flex items-center text-sm font-medium text-white tracking-[-0.01em] bg-[#17A83D] px-3 rounded">
            +{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={filteredData}
            margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D5A60A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#D5A60A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#141414", fontSize: 12, fontFamily: "Lato" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#141414", fontSize: 12, fontFamily: "Lato" }}
              tickFormatter={value => value.toLocaleString("pt-BR")}
              domain={[yAxisMin, yAxisMax]}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#D5A60A" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#D5A60A"
              strokeWidth={2.5}
              fill="url(#colorValue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="absolute bottom-8 right-12 opacity-[0.08] pointer-events-none">
          <span className="font-erstoria text-[80px] font-light text-gray-300">
            Nobile
          </span>
        </div>
      </div>

      {/* Filtros de tempo */}
      <div className="flex items-center gap-2 mt-6">
        {filters.map(filter => (
          <button
            key={filter.value}
            onClick={() => setSelectedFilter(filter.value)}
            className={`
              px-5 py-1.5 rounded-full font-lato text-sm transition-all duration-200
              ${
                selectedFilter === filter.value
                  ? "bg-[#D5A60A] text-white shadow-md"
                  : "bg-[#EFEFEF] text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
