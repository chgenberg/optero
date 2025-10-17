"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  HeadphonesIcon, 
  Users, 
  BookOpen, 
  ArrowRight,
  Check 
} from "lucide-react";
import Stepper from "@/components/Stepper";

const botTypes = [
  {
    id: 'support',
    icon: HeadphonesIcon,
    title: 'Support Bot',
    description: 'Help customers with questions and issues',
    examples: [
      'Answer product questions',
      'Handle returns & refunds',
      'Create support tickets'
    ],
    integrations: ['Zendesk', 'HubSpot'],
    recommended: true
  },
  {
    id: 'lead',
    icon: Users,
    title: 'Lead Generation Bot',
    description: 'Capture and qualify potential customers',
    examples: [
      'Collect contact information',
      'Book meetings & demos',
      'Qualify leads automatically'
    ],
    integrations: ['HubSpot', 'Calendly']
  },
  {
    id: 'knowledge',
    icon: BookOpen,
    title: 'Knowledge Bot',
    description: 'Share information about your business',
    examples: [
      'Product details & pricing',
      'Company policies',
      'General FAQs'
    ],
    integrations: ['Your website']
  }
];

export default function BotBuilderOverview() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('support');

  const handleContinue = () => {
    sessionStorage.setItem('selectedBotType', selectedType);
    if (selectedType === 'support') {
      sessionStorage.setItem('selectedBotSubtype', 'it_helpdesk');
    }
    router.push('/business/bot-builder/customize');
  };

  const handleLearnMore = () => {
    router.push('/business/bot-builder/choose');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={0} steps={['Overview', 'Choose', 'Customize', 'Integrations', 'Test', 'Launch']} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            Choose Your Bot Type
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the type of bot that best fits your needs. Don't worry - you can customize everything in the next steps.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {botTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedType(type.id)}
              className={`
                relative p-6 bg-white rounded-2xl cursor-pointer transition-all
                ${selectedType === type.id 
                  ? 'border-2 border-black shadow-xl' 
                  : 'border-2 border-gray-200 hover:border-gray-400'
                }
              `}
            >
              {type.recommended && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-black text-white text-xs font-semibold rounded-full uppercase tracking-wider">
                  Recommended
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <type.icon className={`w-8 h-8 ${selectedType === type.id ? 'text-black' : 'text-gray-400'}`} />
                {selectedType === type.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-black rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>

              <h3 className="text-xl font-bold text-black mb-2">{type.title}</h3>
              <p className="text-gray-600 mb-4">{type.description}</p>

              <div className="space-y-2 mb-4">
                {type.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    {example}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-semibold">Works with:</span>
                {type.integrations.join(', ')}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button flex items-center justify-center gap-2 px-8"
          >
            Continue with {botTypes.find(t => t.id === selectedType)?.title}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleLearnMore}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button-outline"
          >
            See All Options
          </motion.button>
        </div>
      </div>
    </div>
  );
}
