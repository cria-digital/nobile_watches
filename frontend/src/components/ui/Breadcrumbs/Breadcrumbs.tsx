import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center gap-2 text-[18px] leading-[100%] font-erstoria mb-2 lg:mb-3 ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-pb-500 hover:text-[#D5A60A] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[#D5A60A] font-medium" : "text-pb-500"}>
                {item.label}
              </span>
            )}

            {/* Separador - não renderiza após o último item */}
            {!isLast && (
              <svg
                width="7"
                height="8"
                viewBox="0 0 7 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6.18322 3.20867V3.80067L-0.000781178 7.01667V5.99267C-0.000781178 5.90734 0.0205522 5.83001 0.0632188 5.76067C0.105886 5.69134 0.180552 5.63001 0.287219 5.57667L3.87922 3.76067C3.98589 3.70201 4.09789 3.65401 4.21522 3.61667C4.33789 3.574 4.46589 3.53667 4.59922 3.50467C4.32722 3.44601 4.08722 3.36334 3.87922 3.25667L0.287219 1.43267C0.180552 1.37934 0.105886 1.32067 0.0632188 1.25667C0.0205522 1.18734 -0.000781178 1.10734 -0.000781178 1.01667V0.000671387L6.18322 3.20867Z"
                  fill="#141414"
                />
              </svg>
            )}
          </div>
        );
      })}
    </nav>
  );
}
