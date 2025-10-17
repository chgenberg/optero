"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isCompleted ? 'bg-black text-white' : isActive ? 'bg-black text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}
                  `}
                  animate={isActive ? {
                    boxShadow: [
                      "0 0 0 0 rgba(0, 0, 0, 0)",
                      "0 0 0 8px rgba(0, 0, 0, 0.1)",
                      "0 0 0 0 rgba(0, 0, 0, 0)"
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </motion.div>
                <span className={`
                  mt-2 text-xs font-medium uppercase tracking-wider
                  ${isActive ? 'text-black' : 'text-gray-400'}
                `}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
