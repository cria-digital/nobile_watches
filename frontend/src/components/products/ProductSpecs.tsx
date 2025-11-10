import { Product } from "@/types/product";

interface ProductSpecsProps {
  product: Product;
}

// Componente auxiliar para linhas de dados com padrão zebrado
function DataRow({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  return (
    <div
      className={`flex justify-between items-start gap-4 py-2 pl-3 pr-6 text-pb-500 font-light ${
        index % 2 === 0 ? "bg-[#EFEFEF]" : ""
      }`}
    >
      <span className="font-lato text-sm tracking-[-0.01em] whitespace-nowrap">
        {label}:
      </span>
      <span className="font-lato text-sm text-right tracking-[-0.01em]">{value}</span>
    </div>
  );
}

// Componente de bloco de especificações
function SpecBlock({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white ${className}`}>
      <h3 className="font-erstoria text-xl text-pb-500 tracking-[-0.01em] mb-3">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  // Função auxiliar para renderizar DataRow com índice
  const renderDataRow = (
    label: string,
    value: string | number | undefined,
    index: number
  ) => {
    if (!value) return null;
    return <DataRow key={label} label={label} value={String(value)} index={index} />;
  };

  // Preparar dados básicos
  const basicData = [
    // { label: "Código do anúncio", value: product.adCode },
    { label: "Marca", value: product.brand },
    { label: "Modelo", value: product.model },
    { label: "Número de referência", value: product.referenceNumber },
    { label: "Ano de fabricação", value: product.year?.toString() },
    { label: "Estado", value: product.condition },
    { label: "Gênero", value: product.gender },
    //  { label: "Localização", value: product.location },
    { label: "Preço", value: `R$ ${product.price.toLocaleString("pt-BR")}` },
    //  { label: "Disponibilidade", value: product.availability },
  ].filter(item => item.value);

  // Preparar dados de movimento
  const movementData = [
    { label: "Movimento", value: product.movement },
    //  { label: "Calibre", value: product.caliber },
    {
      label: "Reserva de corda",
      //   value: product.powerReserve ? `${product.powerReserve}h` : undefined,
    },
    //   { label: "Número de rubis", value: product.jewels?.toString() },
  ].filter(item => item.value);

  // Preparar dados de bracelete
  const braceletData = [
    { label: "Material do bracelete", value: product.braceletMaterial },
    { label: "Cor do bracelete", value: product.braceletColor },
    //   { label: "Fecho", value: product.clasp },
    { label: "Material do fecho", value: product?.claspType },
  ].filter(item => item.value);

  // Preparar dados de caixa
  const caseData = [
    { label: "Material da caixa", value: product.caseMaterial },
    {
      label: "Diâmetro",
      value: product.caseDiameter ? `${product.caseDiameter}mm` : undefined,
    },
    { label: "Estanqueidade", value: product.waterResistance },
    //{ label: "Material da luneta", value: product.bezelMaterial },
    { label: "Vidro", value: product.glassType },
    { label: "Mostrador", value: product.dialColor },
    //   { label: "Algarismos do mostrador", value: product.dialNumbers },
  ].filter(item => item.value);

  // Preparar outras características (usando os mesmos dados de movimento)
  const otherData = [
    { label: "Movimento", value: product.movement },
    //   { label: "Calibre", value: product.caliber },

    //   { label: "Número de rubis", value: product.jewels?.toString() },
  ].filter(item => item.value);

  return (
    <div className="mb-6 lg:mb-12">
      {/* Grid Layout: 3 colunas x 2 linhas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-min">
        {/* Dados Básicos - Ocupa 2 linhas na primeira coluna */}
        <SpecBlock title="Dados Básicos" className="md:row-span-2">
          {basicData.map((item, index) => (
            <DataRow
              key={item.label}
              label={item.label}
              value={item.value!}
              index={index}
            />
          ))}
        </SpecBlock>

        {/* Movimento - Segunda coluna, primeira linha */}
        <SpecBlock title="Movimento">
          {movementData.map((item, index) => (
            <DataRow
              key={item.label}
              label={item.label}
              value={item.value!}
              index={index}
            />
          ))}
        </SpecBlock>

        {/* Bracelete - Terceira coluna, primeira linha */}
        <SpecBlock title="Bracelete">
          {braceletData.map((item, index) => (
            <DataRow
              key={item.label}
              label={item.label}
              value={item.value!}
              index={index}
            />
          ))}
        </SpecBlock>

        {/* Caixa - Segunda coluna, segunda linha */}
        <SpecBlock title="Caixa">
          {caseData.map((item, index) => (
            <DataRow
              key={item.label}
              label={item.label}
              value={item.value!}
              index={index}
            />
          ))}
        </SpecBlock>

        {/* Outras características - Terceira coluna, segunda linha */}
        <SpecBlock title="Outras características">
          {otherData.map((item, index) => (
            <DataRow
              key={item.label}
              label={item.label}
              value={item.value!}
              index={index}
            />
          ))}
        </SpecBlock>
      </div>
    </div>
  );
}
