"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  HeadphonesIcon, 
  Users, 
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import Stepper from "@/components/Stepper";

const detailedBotTypes = [
  {
    id: 'support',
    icon: HeadphonesIcon,
    title: 'Support Bot',
    description: 'Help customers with questions and issues',
    subtypes: [
      {
        id: 'it_helpdesk',
        name: 'IT Helpdesk',
        description: 'Password resets, technical issues, system access',
        requiresApproval: true
      },
      {
        id: 'returns',
        name: 'Returns & Refunds',
        description: 'Handle return requests, refund processing',
        requiresApproval: true
      },
      {
        id: 'faq',
        name: 'General Support',
        description: 'Answer common questions, provide help articles',
        requiresApproval: false
      }
    ],
    integrations: ['Zendesk', 'HubSpot', 'Slack'],
    useCases: [
      'Reduce support ticket volume by 60%',
      'Available 24/7 for instant help',
      'Automatically create and route tickets'
    ]
  },
  {
    id: 'lead',
    icon: Users,
    title: 'Lead Generation Bot',
    description: 'Capture and qualify potential customers',
    subtypes: [
      {
        id: 'standard',
        name: 'Standard Lead Capture',
        description: 'Collect contact info, basic qualification',
        requiresApproval: false
      },
      {
        id: 'enterprise',
        name: 'Enterprise Sales',
        description: 'Complex B2B lead qualification, routing',
        requiresApproval: true
      },
      {
        id: 'event',
        name: 'Event Registration',
        description: 'Register for webinars, demos, events',
        requiresApproval: false
      }
    ],
    integrations: ['HubSpot', 'Calendly', 'Salesforce'],
    useCases: [
      'Qualify leads instantly 24/7',
      'Book meetings directly in calendars',
      'Sync with your CRM automatically'
    ]
  },
  {
    id: 'knowledge',
    icon: BookOpen,
    title: 'Knowledge Bot',
    description: 'Share information about your business',
    subtypes: [
      {
        id: 'faq',
        name: 'FAQ Bot',
        description: 'Answer common questions from your website',
        requiresApproval: false
      },
      {
        id: 'product',
        name: 'Product Expert',
        description: 'Detailed product info, comparisons, recommendations',
        requiresApproval: false
      },
      {
        id: 'multilingual',
        name: 'Multilingual Assistant',
        description: 'Support multiple languages automatically',
        requiresApproval: false
      }
    ],
    integrations: ['Your website', 'Knowledge base'],
    useCases: [
      'Answer questions instantly',
      'Reduce repetitive inquiries',
      'Available in multiple languages'
    ]
  },
  {
    id: 'workflow',
    icon: Zap,
    title: 'Workflow Automation Bot',
    description: 'Automate internal processes and tasks',
    subtypes: [
      {
        id: 'hr',
        name: 'HR Assistant',
        description: 'Leave requests, employee onboarding',
        requiresApproval: true
      },
      {
        id: 'finance',
        name: 'Finance Helper',
        description: 'Invoice lookup, expense reports',
        requiresApproval: true
      },
      {
        id: 'internal',
        name: 'Internal Assistant',
        description: 'Company info, policies, procedures',
        requiresApproval: false
      }
    ],
    integrations: ['Fortnox', 'HubSpot', 'Internal APIs'],
    useCases: [
      'Automate repetitive tasks',
      'Connect multiple systems',
      'Streamline internal processes'
    ]
  }
];

export default function BotBuilderChoose() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [expandedType, setExpandedType] = useState<string | null>(null);

  useEffect(() => {
    const storedType = sessionStorage.getItem('selectedBotType');
    const storedSubtype = sessionStorage.getItem('selectedBotSubtype');
    if (storedType) {
      setSelectedType(storedType);
      setSelectedSubtype(storedSubtype || '');
      setExpandedType(storedType);
    }
  }, []);

  const handleSelect = (typeId: string, subtypeId: string) => {
    setSelectedType(typeId);
    setSelectedSubtype(subtypeId);
    sessionStorage.setItem('selectedBotType', typeId);
    sessionStorage.setItem('selectedBotSubtype', subtypeId);
  };

  const handleContinue = () => {
    if (selectedType && selectedSubtype) {
      router.push('/business/bot-builder/customize');
    }
  };

  const handleBack = () => {
    router.push('/business/bot-builder/overview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={1} steps={['Overview', 'Choose', 'Customize', 'Integrations', 'Test', 'Launch']} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to overview
          </button>

          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            Choose Your Bot Configuration
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Select the specific type of bot you need. Each option is pre-configured with best practices for that use case.
          </p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {detailedBotTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden"
            >
              <div
                onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <type.icon className="w-8 h-8 text-black" />
                    <div>
                      <h3 className="text-2xl font-bold text-black">{type.title}</h3>
                      <p className="text-gray-600">{type.description}</p>
                    </div>
                  </div>
                  {expandedType === type.id ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedType === type.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 pb-6"
                >
                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid gap-4 mb-6">
                      {type.subtypes.map((subtype) => (
                        <motion.div
                          key={subtype.id}
                          onClick={() => handleSelect(type.id, subtype.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`
                            p-4 rounded-xl cursor-pointer transition-all
                            ${selectedType === type.id && selectedSubtype === subtype.id
                              ? 'bg-black text-white'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg mb-1">{subtype.name}</h4>
                              <p className={`text-sm ${
                                selectedType === type.id && selectedSubtype === subtype.id
                                  ? 'text-gray-300'
                                  : 'text-gray-600'
                              }`}>
                                {subtype.description}
                              </p>
                            </div>
                            {subtype.requiresApproval && (
                              <span className={`
                                text-xs font-semibold px-2 py-1 rounded-full
                                ${selectedType === type.id && selectedSubtype === subtype.id
                                  ? 'bg-white/20 text-white'
                                  : 'bg-yellow-100 text-yellow-800'
                                }
                              `}>
                                Requires Approval
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">
                          Use Cases
                        </h4>
                        <ul className="space-y-2">
                          {type.useCases.map((useCase, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                              {useCase}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">
                          Integrations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {type.integrations.map((integration) => (
                            <span
                              key={integration}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {integration}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.button
            onClick={handleContinue}
            disabled={!selectedType || !selectedSubtype}
            whileHover={selectedType && selectedSubtype ? { scale: 1.02 } : {}}
            whileTap={selectedType && selectedSubtype ? { scale: 0.98 } : {}}
            className={`
              minimal-button flex items-center gap-2 px-8
              ${!selectedType || !selectedSubtype ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Continue to Customize
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
