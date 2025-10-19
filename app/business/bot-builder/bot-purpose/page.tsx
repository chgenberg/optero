"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  Building2, 
  HelpCircle,
  ArrowRight,
  MessageSquare,
  Shield,
  Globe,
  Database,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Stepper from "@/components/Stepper";

const botPurposes = [
  {
    id: 'customer',
    icon: Users,
    title: 'Customer Bot',
    subtitle: 'For website visitors',
    description: 'Help customers, answer questions, and generate leads on your website',
    features: [
      'Embeddable widget for any website',
      'Answers customer questions 24/7',
      'Captures leads and contact info',
      'Integrates with CRM systems',
      'Customizable appearance'
    ],
    deployment: 'HTML embed code',
    audience: 'External visitors',
    examples: [
      'Product inquiries',
      'Support questions',
      'Lead qualification',
      'Sales assistance'
    ]
  },
  {
    id: 'internal',
    icon: Building2,
    title: 'Internal Bot',
    subtitle: 'For your team',
    description: 'Help employees with company policies, procedures, and internal knowledge',
    features: [
      'Private login-based access',
      'Company knowledge base',
      'Policy & procedure guidance',
      'Excel formulas & calculations',
      'Brand guidelines & resources'
    ],
    deployment: 'Secure dashboard',
    audience: 'Internal employees',
    examples: [
      'HR policies',
      'Brand colors & logos',
      'Expense procedures',
      'Internal documentation'
    ]
  }
];

export default function BotPurposePage() {
  const router = useRouter();
  const [selectedPurpose, setSelectedPurpose] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    // Check if previous steps are completed
    const websiteUrl = sessionStorage.getItem("botWebsiteUrl");
    const documents = sessionStorage.getItem("botDocuments");
    
    if (!websiteUrl && !documents) {
      router.push("/business/bot-builder/identify");
    }
  }, [router]);

  const handleContinue = () => {
    if (!selectedPurpose) return;
    
    // Store the bot purpose
    sessionStorage.setItem("botPurpose", selectedPurpose);
    
    // Set appropriate bot type based on purpose
    if (selectedPurpose === 'internal') {
      sessionStorage.setItem("selectedBotType", "knowledge");
      sessionStorage.setItem("selectedBotSubtype", "internal");
    }
    
    // Navigate to next step
    router.push("/business/bot-builder/customize");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper 
        currentStep={3} 
        steps={['Start', 'Add Knowledge', 'Analyze', 'Choose Purpose', 'Customize', 'Test', 'Launch']} 
      />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>NEW STEP</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            WHO WILL USE YOUR BOT?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose how your AI assistant will be deployed. This determines features, access controls, and integration options.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {botPurposes.map((purpose, index) => (
            <motion.div
              key={purpose.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPurpose(purpose.id)}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedPurpose === purpose.id 
                  ? 'scale-[1.02] shadow-2xl' 
                  : 'hover:scale-[1.01] hover:shadow-xl'
              }`}
            >
              <div className={`minimal-card p-8 h-full ${
                selectedPurpose === purpose.id 
                  ? 'ring-4 ring-gray-900' 
                  : ''
              }`}>
                {/* Selection indicator */}
                {selectedPurpose === purpose.id && (
                  <div className="absolute -top-3 -right-3 bg-gray-900 text-white rounded-full p-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}

                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl transition-colors ${
                    selectedPurpose === purpose.id 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <purpose.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-wider text-black">
                      {purpose.title}
                    </h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">
                      {purpose.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6">
                  {purpose.description}
                </p>

                {/* Key info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Globe className="w-3 h-3" />
                      <span>DEPLOYMENT</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {purpose.deployment}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Shield className="w-3 h-3" />
                      <span>AUDIENCE</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {purpose.audience}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                    Key Features
                  </p>
                  {purpose.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>

                {/* Use cases */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
                    Common Use Cases
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {purpose.examples.map((example, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                Not sure which to choose?
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Choose Customer Bot if:</strong> You want to help website visitors, 
                  answer product questions, or capture leads from potential customers.
                </p>
                <p>
                  <strong>Choose Internal Bot if:</strong> You want to help your team with 
                  company policies, procedures, brand guidelines, or internal documentation.
                </p>
                <p className="italic">
                  You can always create additional bots later for different purposes!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedPurpose}
            className={`minimal-button px-8 py-4 text-lg inline-flex items-center gap-3 transition-all ${
              !selectedPurpose 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:gap-5'
            }`}
          >
            CONTINUE TO CUSTOMIZE
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
