import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  className,
  disabled = false
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === selectedValue)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    onValueChange?.(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-[#e7e7f0] bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-1 focus:ring-[#7c47e1] focus:border-[#7c47e1]",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#fafafa] cursor-pointer",
          isOpen && "ring-1 ring-[#7c47e1] border-[#7c47e1]"
        )}
      >
        <span className={cn(
          selectedOption ? "text-[#040222]" : "text-[#5b5675]",
          "font-euclid"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-[#5b5675] transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#e7e7f0] bg-white shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-sm rounded-md transition-colors",
                  "font-euclid text-left hover:bg-[#f8f7fc]",
                  selectedValue === option.value
                    ? "bg-[#7c47e1] text-white"
                    : "text-[#040222]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}