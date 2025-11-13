import { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder = "Selecione uma opção",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col items-start gap-2">
        <label htmlFor={props.id} className="text-sm text-pb-500">
          {label}
        </label>
        <div className="w-full relative">
          <select
            ref={ref}
            className={`w-full h-[48px] px-4 py-3 border border-[#EFEFEF] rounded-xl focus:outline-none transition-colors appearance-none text-sm bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? "border-[#E81F33]" : ""
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options &&
              options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}

            {children}
          </select>

          {/* Chevron down icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <span id={`${props.name}-hint`} role="alert">
            <div className="text-xs text-[#E81F33] leading-[133%]">{error}</div>
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
