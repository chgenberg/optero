"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  X, 
  ArrowRight,
  HelpCircle,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  LifeBuoy,
  Rocket,
  ShoppingBag,
  BarChart3,
  ShoppingCart
} from "lucide-react";
import Stepper from "@/components/Stepper";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: (props: { className?: string }) => JSX.Element;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
  }[];
  helpSteps: string[];
  helpUrl?: string;
}

const integrations: Integration[] = [
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Connect to create and manage support tickets',
    icon: (props) => <LifeBuoy {...props} />,
    fields: [
      { name: 'domain', label: 'Zendesk Domain', type: 'url', placeholder: 'yourcompany.zendesk.com' },
      { name: 'email', label: 'Agent Email', type: 'text', placeholder: 'agent@yourcompany.com' },
      { name: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your API token' }
    ],
    helpSteps: [
      'Log in to your Zendesk Admin Center',
      'Go to Apps and integrations → APIs → Zendesk API',
      'Click on "Settings" tab',
      'Enable "Password access" if not already enabled',
      'Click "Add API token" and give it a description',
      'Copy the token immediately (you won\'t see it again)',
      'Use format: youremail@company.com/token:YOUR_API_TOKEN'
    ],
    helpUrl: 'https://support.zendesk.com/hc/en-us/articles/4408889192858'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync leads and manage CRM data',
    icon: (props) => <Rocket {...props} />,
    fields: [
      { name: 'apiKey', label: 'Private App Access Token', type: 'password', placeholder: 'pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
    ],
    helpSteps: [
      'Go to Settings → Integrations → Private Apps',
      'Click "Create a private app"',
      'Name your app (e.g., "AI Bot Integration")',
      'Go to the "Scopes" tab',
      'Select these scopes: contacts (read/write), companies (read/write), deals (read/write)',
      'Click "Create app"',
      'Copy the access token from the next screen'
    ],
    helpUrl: 'https://developers.hubspot.com/docs/api/private-apps'
  },
  {
    id: 'centra',
    name: 'Centra',
    description: 'E-commerce platform integration',
    icon: (props) => <ShoppingBag {...props} />,
    fields: [
      { name: 'apiBaseUrl', label: 'API Base URL', type: 'url', placeholder: 'https://api.centra.com' },
      { name: 'storeId', label: 'Store ID', type: 'text', placeholder: 'Your store ID' },
      { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Your access token' }
    ],
    helpSteps: [
      'Log in to your Centra admin panel',
      'Navigate to System → API → Tokens',
      'Click "Create new token"',
      'Select "Integration API" as token type',
      'Set permissions (read orders, products, customers)',
      'Copy the generated token',
      'Find your Store ID in Settings → Stores'
    ]
  },
  {
    id: 'fortnox',
    name: 'Fortnox',
    description: 'Swedish accounting and invoicing',
    icon: (props) => <BarChart3 {...props} />,
    fields: [
      { name: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your client ID' },
      { name: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your client secret' }
    ],
    helpSteps: [
      'Go to Fortnox Developer Portal',
      'Create a new integration or use existing',
      'Navigate to "Integration settings"',
      'Copy Client ID and Client Secret',
      'Make sure your integration has required scopes',
      'Add redirect URL: https://myaiguy.com/callback'
    ],
    helpUrl: 'https://developer.fortnox.se/documentation/'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce store integration',
    icon: (props) => <ShoppingCart {...props} />,
    fields: [
      { name: 'storeDomain', label: 'Store Domain', type: 'url', placeholder: 'yourstore.myshopify.com' },
      { name: 'accessToken', label: 'Admin API Access Token', type: 'password', placeholder: 'shpat_xxxxxxxxxxxxxxxx' }
    ],
    helpSteps: [
      'Go to Shopify Admin → Settings → Apps',
      'Click "Develop apps"',
      'Create a new app or select existing',
      'Configure Admin API scopes (products, orders, customers)',
      'Install the app to your store',
      'Go to API credentials and copy the Admin API access token'
    ],
    helpUrl: 'https://help.shopify.com/en/manual/apps/app-types/custom-apps'
  }
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [activeIntegrations, setActiveIntegrations] = useState<Record<string, boolean>>({});
  const [integrationData, setIntegrationData] = useState<Record<string, any>>({});
  const [verificationStatus, setVerificationStatus] = useState<Record<string, 'idle' | 'verifying' | 'success' | 'error'>>({});
  const [showHelp, setShowHelp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load any existing integrations
    const botId = sessionStorage.getItem('currentBotId');
    if (botId) {
      loadExistingIntegrations(botId);
    }
  }, []);

  const loadExistingIntegrations = async (botId: string) => {
    // In a real app, this would fetch from the API
    // For now, we'll just simulate
  };

  const handleToggleIntegration = (integrationId: string) => {
    setActiveIntegrations(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
    
    if (!activeIntegrations[integrationId]) {
      // Initialize empty data for this integration
      setIntegrationData(prev => ({
        ...prev,
        [integrationId]: {}
      }));
    }
  };

  const handleFieldChange = (integrationId: string, fieldName: string, value: string) => {
    setIntegrationData(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [fieldName]: value
      }
    }));
  };

  const handleVerify = async (integrationId: string) => {
    setVerificationStatus(prev => ({ ...prev, [integrationId]: 'verifying' }));
    try {
      if (integrationId === 'centra') {
        const res = await fetch(`/api/integrations/centra/verify?botId=${encodeURIComponent(sessionStorage.getItem('currentBotId') || '')}`);
        const j = await res.json();
        setVerificationStatus(prev => ({ ...prev, [integrationId]: j.ok ? 'success' : 'error' }));
      } else if (integrationId === 'hubspot') {
        const token = integrationData?.hubspot?.apiKey;
        const res = await fetch('/api/integrations/hubspot/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: token }) });
        const j = await res.json();
        setVerificationStatus(prev => ({ ...prev, [integrationId]: j.ok ? 'success' : 'error' }));
      } else if (integrationId === 'zendesk') {
        const data = integrationData?.zendesk || {};
        const res = await fetch('/api/integrations/zendesk/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: data.domain, email: data.email, apiToken: data.apiToken }) });
        const j = await res.json();
        setVerificationStatus(prev => ({ ...prev, [integrationId]: j.ok ? 'success' : 'error' }));
      } else if (integrationId === 'shopify') {
        const data = integrationData?.shopify || {};
        const res = await fetch('/api/integrations/shopify/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeDomain: data.storeDomain, accessToken: data.accessToken }) });
        const j = await res.json();
        setVerificationStatus(prev => ({ ...prev, [integrationId]: j.ok ? 'success' : 'error' }));
      } else {
        // For others, mark success if required fields filled
        setVerificationStatus(prev => ({ ...prev, [integrationId]: allFieldsFilled(integrationId) ? 'success' : 'error' }));
      }
    } catch {
      setVerificationStatus(prev => ({ ...prev, [integrationId]: 'error' }));
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    
    // Save integration settings
    const botId = sessionStorage.getItem('currentBotId');
    if (botId) {
      // In a real app, save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Persist if any integration is active
    const anyActive = Object.values(activeIntegrations).some(Boolean);
    sessionStorage.setItem('hasIntegrations', anyActive ? 'true' : 'false');
    
    router.push('/business/bot-builder/test');
  };

  const handleSkip = () => {
    router.push('/business/bot-builder/test');
  };

  const getActiveCount = () => {
    return Object.values(activeIntegrations).filter(Boolean).length;
  };

  const allFieldsFilled = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    const data = integrationData[integrationId] || {};
    return integration?.fields.every(field => data[field.name]?.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={3} steps={['Overview', 'Choose', 'Customize', 'Integrations', 'Test', 'Launch']} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            Connect Your Tools
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect your existing tools to make your bot more powerful. You can skip this step and add integrations later.
          </p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                bg-white rounded-2xl border-2 transition-all
                ${activeIntegrations[integration.id] 
                  ? 'border-black shadow-xl' 
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <integration.icon className="w-6 h-6 text-black" />
                    <div>
                      <h3 className="text-xl font-bold text-black">{integration.name}</h3>
                      <p className="text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHelp(showHelp === integration.id ? null : integration.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="How to find API credentials"
                    >
                      <HelpCircle className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleToggleIntegration(integration.id)}
                      className={`
                        w-12 h-6 rounded-full transition-all duration-300
                        ${activeIntegrations[integration.id] 
                          ? 'bg-black' 
                          : 'bg-gray-300'
                        }
                      `}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{
                          x: activeIntegrations[integration.id] ? 24 : 2
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {activeIntegrations[integration.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {integration.fields.map(field => (
                        <div key={field.name}>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            value={integrationData[integration.id]?.[field.name] || ''}
                            onChange={(e) => handleFieldChange(integration.id, field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
                          />
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-4">
                        <button
                          onClick={() => handleVerify(integration.id)}
                          disabled={!allFieldsFilled(integration.id) || verificationStatus[integration.id] === 'verifying'}
                          className={`
                            minimal-button-outline flex items-center gap-2
                            ${!allFieldsFilled(integration.id) ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          {verificationStatus[integration.id] === 'verifying' ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Verifying...
                            </>
                          ) : verificationStatus[integration.id] === 'success' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Verified
                            </>
                          ) : verificationStatus[integration.id] === 'error' ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              Failed - Check credentials
                            </>
                          ) : (
                            <>
                              <Link2 className="w-4 h-4" />
                              Verify Connection
                            </>
                          )}
                        </button>

                        {verificationStatus[integration.id] === 'success' && (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Help Popup */}
              <AnimatePresence>
                {showHelp === integration.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t-2 border-gray-100 bg-gray-50 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-black">How to find your {integration.name} credentials:</h4>
                      <button
                        onClick={() => setShowHelp(null)}
                        className="p-1 hover:bg-white rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <ol className="space-y-2">
                      {integration.helpSteps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700">
                          <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    {integration.helpUrl && (
                      <a
                        href={integration.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-sm text-black hover:underline"
                      >
                        View official documentation
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleContinue}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button flex items-center justify-center gap-2 px-8"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue {getActiveCount() > 0 && `with ${getActiveCount()} integration${getActiveCount() > 1 ? 's' : ''}`}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
          
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button-outline"
          >
            Skip for now
          </motion.button>
        </div>
      </div>
    </div>
  );
}
