import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { forwardRef, useState } from "react";
import { Icon } from "../Icon";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  icon?: string;
  iconAlt?: string;
  showPasswordToggle?: boolean;
  leftElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconAlt = "",
      type = "text",
      className = "",
      showPasswordToggle = false,
      leftElement,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showPasswordToggle && showPassword ? "text" : type;

    return (
      <div className="flex flex-col items-start gap-2">
        {label && (
          <label htmlFor={props.id} className="text-sm text-pb-500">
            {label}
          </label>
        )}

        <div className="w-full relative">
          {/* Ícone à esquerda ou elemento customizado */}
          {leftElement ? (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              {leftElement}
            </div>
          ) : icon ? (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon src={icon} alt={iconAlt} />
            </div>
          ) : null}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={`w-full ${icon || leftElement ? "pl-12.5" : "pl-4"} ${
              showPasswordToggle ? "pr-10" : "pr-4"
            } py-3 bg-[#F7F7F7] border border-[#EFEFEF] rounded-xl focus:outline-none transition-colors ${
              error ? "border-[#E81F33]" : ""
            } ${className}`}
            {...props}
          />
          {/* Toggle de senha */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-6 w-6 text-pb-500" />
              ) : (
                <EyeIcon className="h-6 w-6 text-pb-500" />
              )}
            </button>
          )}
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

Input.displayName = "Input";
