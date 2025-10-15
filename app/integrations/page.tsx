"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Link2, Webhook, MessageSquare, Calendar, 
  ShoppingCart, HeadphonesIcon, Mail, Database, 
  Check, X, Plus, Key, Eye, EyeOff
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'crm' | 'support' | 'ecommerce' | 'accounting' | 'communication' | 'calendar';
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'toggle';
    placeholder?: string;
    help?: string;
  }>;
  enabled?: boolean;
  comingSoon?: boolean;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Send bot events to your server',
    icon: Webhook,
    category: 'communication',
    fields: [
      { key: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://your-server.com/webhook', help: 'Receives lead summaries and events' }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications in Slack channels',
    icon: MessageSquare,
    category: 'communication',
    fields: [
      { key: 'webhook', label: 'Slack Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...', help: 'Sends notifications for qualified leads' }
    ]
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Enable booking links in chat',
    icon: Calendar,
    category: 'calendar',
    fields: [
      { key: 'url', label: 'Calendly Link', type: 'url', placeholder: 'https://calendly.com/your-link', help: 'Shows booking CTA in chat' }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts automatically',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'enabled', label: 'Enable HubSpot Sync', type: 'toggle' },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'pat-na1-...', help: 'Private App Access Token' }
    ]
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Create support tickets from chat',
    icon: HeadphonesIcon,
    category: 'support',
    fields: [
      { key: 'domain', label: 'Zendesk Domain', type: 'text', placeholder: 'yourcompany.zendesk.com' },
      { key: 'email', label: 'Agent Email', type: 'text', placeholder: 'agent@company.com' },
      { key: 'apiToken', label: 'API Token', type: 'password' }
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Product recommendations & order status',
    icon: ShoppingCart,
    category: 'ecommerce',
    fields: [
      { key: 'domain', label: 'Store Domain', type: 'text', placeholder: 'store.myshopify.com' },
      { key: 'accessToken', label: 'Admin API Access Token', type: 'password' }
    ]
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Add leads to email lists',
    icon: Mail,
    category: 'communication',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'listId', label: 'Audience ID', type: 'text', placeholder: 'abc123def' },
      { key: 'datacenter', label: 'Data Center', type: 'text', placeholder: 'us1', help: 'Found in your API key after the dash' }
    ]
  },
  {
    id: 'fortnox',
    name: 'Fortnox',
    description: 'Swedish accounting integration',
    icon: Database,
    category: 'accounting',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'authCode', label: 'Authorization Code', type: 'text' }
    ]
  },
  // --- CRM (API key based) ---
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Sync deals and contacts',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'xxxxxxxxxxxxxxxx' }
    ],
    comingSoon: true
  },
  // --- Support ---
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Create conversations and users',
    icon: HeadphonesIcon,
    category: 'support',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Bearer token' }
    ],
    comingSoon: true
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Create support tickets',
    icon: HeadphonesIcon,
    category: 'support',
    fields: [
      { key: 'domain', label: 'Domain', type: 'text', placeholder: 'yourcompany.freshdesk.com' },
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'gorgias',
    name: 'Gorgias',
    description: 'Support for Shopify brands',
    icon: HeadphonesIcon,
    category: 'support',
    fields: [
      { key: 'domain', label: 'Domain', type: 'text', placeholder: 'yourbrand.gorgias.com' },
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'crisp',
    name: 'Crisp',
    description: 'Send messages and create contacts',
    icon: HeadphonesIcon,
    category: 'support',
    fields: [
      { key: 'websiteId', label: 'Website ID', type: 'text' },
      { key: 'token', label: 'REST Token', type: 'password' }
    ],
    comingSoon: true
  },
  // --- E-commerce ---
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Products, orders & stock',
    icon: ShoppingCart,
    category: 'ecommerce',
    fields: [
      { key: 'storeUrl', label: 'Store URL', type: 'url', placeholder: 'https://yourstore.com' },
      { key: 'consumerKey', label: 'Consumer Key', type: 'password' },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'magento',
    name: 'Magento',
    description: 'Catalog and orders',
    icon: ShoppingCart,
    category: 'ecommerce',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'url' },
      { key: 'accessToken', label: 'Access Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    description: 'Products and customers',
    icon: ShoppingCart,
    category: 'ecommerce',
    fields: [
      { key: 'storeHash', label: 'Store Hash', type: 'text' },
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'accessToken', label: 'Access Token', type: 'password' }
    ],
    comingSoon: true
  },
  // --- Marketing ---
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Sync email subscribers and events',
    icon: Mail,
    category: 'communication',
    fields: [
      { key: 'apiKey', label: 'Private API Key', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'brevo',
    name: 'Brevo (Sendinblue)',
    description: 'Email & SMS campaigns',
    icon: Mail,
    category: 'communication',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    description: 'Contacts and automations',
    icon: Mail,
    category: 'communication',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', placeholder: 'https://youraccount.api-us1.com' },
      { key: 'apiKey', label: 'API Key', type: 'password' }
    ],
    comingSoon: true
  },
  // --- Docs / KB ---
  {
    id: 'notion',
    name: 'Notion',
    description: 'Pull pages for knowledge base',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'integrationToken', label: 'Integration Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Sync spaces/pages',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'site', label: 'Site Base URL', type: 'url', placeholder: 'https://yourcompany.atlassian.net/wiki' },
      { key: 'email', label: 'Atlassian Email', type: 'text' },
      { key: 'apiToken', label: 'API Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Use bases as data sources',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password' },
      { key: 'baseId', label: 'Base ID', type: 'text' }
    ],
    comingSoon: true
  },
  // --- Project / Tickets ---
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create issues from chats',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'site', label: 'Site Base URL', type: 'url', placeholder: 'https://yourcompany.atlassian.net' },
      { key: 'email', label: 'Atlassian Email', type: 'text' },
      { key: 'apiToken', label: 'API Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Tasks and projects',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'pat', label: 'Personal Access Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Boards & cards',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'apiToken', label: 'Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Boards & items',
    icon: Database,
    category: 'crm',
    fields: [
      { key: 'apiToken', label: 'API Token', type: 'password' }
    ],
    comingSoon: true
  },
  // --- Messaging / Payments ---
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS & WhatsApp via Twilio',
    icon: MessageSquare,
    category: 'communication',
    fields: [
      { key: 'accountSid', label: 'Account SID', type: 'text' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1...' }
    ],
    comingSoon: true
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Bot API token',
    icon: MessageSquare,
    category: 'communication',
    fields: [
      { key: 'botToken', label: 'Bot Token', type: 'password' }
    ],
    comingSoon: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments and checkout links',
    icon: Mail,
    category: 'communication',
    fields: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' }
    ],
    comingSoon: true
  }
];

function IntegrationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const botId = searchParams?.get('botId');
  
  const [integrations, setIntegrations] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (botId) {
      loadIntegrations();
    } else {
      setLoading(false);
    }
  }, [botId]);

  const loadIntegrations = async () => {
    try {
      const res = await fetch(`/api/bots/integrations/get?botId=${botId}`);
      const data = await res.json();
      setIntegrations(data.integrations || {});
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegrations = async () => {
    if (!botId) {
      alert('Please select a bot first');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/bots/integrations/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, integrations })
      });
      
      if (!res.ok) throw new Error('Save failed');
      alert('✅ Integrations saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Failed to save integrations');
    } finally {
      setSaving(false);
    }
  };

  const updateIntegration = (integrationId: string, field: string, value: any) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }));
  };

  const togglePassword = (integrationId: string, field: string) => {
    const key = `${integrationId}-${field}`;
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const categories = [
    { id: 'all', name: 'ALL', count: AVAILABLE_INTEGRATIONS.length },
    { id: 'crm', name: 'CRM', count: AVAILABLE_INTEGRATIONS.filter(i => i.category === 'crm').length },
    { id: 'support', name: 'SUPPORT', count: AVAILABLE_INTEGRATIONS.filter(i => i.category === 'support').length },
    { id: 'ecommerce', name: 'E-COMMERCE', count: AVAILABLE_INTEGRATIONS.filter(i => i.category === 'ecommerce').length },
    { id: 'communication', name: 'COMMUNICATION', count: AVAILABLE_INTEGRATIONS.filter(i => i.category === 'communication').length },
    { id: 'accounting', name: 'ACCOUNTING', count: AVAILABLE_INTEGRATIONS.filter(i => i.category === 'accounting').length },
    { id: 'calendar', name: 'CALENDAR', count: AVAILABLE_INTEGRATIONS.filter(i => i.category === 'calendar').length }
  ];

  const filteredIntegrations = activeCategory === 'all' 
    ? AVAILABLE_INTEGRATIONS 
    : AVAILABLE_INTEGRATIONS.filter(i => i.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button
            onClick={() => router.push(botId ? `/dashboard/${botId}` : '/dashboard')}
            className="text-sm text-gray-600 hover:text-black transition-colors mb-6 flex items-center gap-2 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {botId ? 'Bot' : 'Dashboard'}
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-wider text-black mb-2">
                INTEGRATIONS
              </h1>
              <p className="text-gray-600 uppercase tracking-wider text-sm">
                Connect your bot to external services
              </p>
            </div>
            
            {botId && (
              <motion.button
                onClick={saveIntegrations}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="minimal-button disabled:opacity-50"
              >
                {saving ? 'SAVING...' : 'SAVE ALL CHANGES'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {!botId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="minimal-card animate-pulse-shadow text-center py-12 mb-12"
          >
            <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Select a bot to configure its integrations</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="minimal-button"
            >
              GO TO DASHBOARD
            </button>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:text-black'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </motion.div>

        {/* Integrations Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredIntegrations.map((integration, index) => {
            const Icon = integration.icon;
            const isConfigured = integration.fields.some(field => 
              integrations[integration.id]?.[field.key]
            );

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="minimal-card animate-pulse-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-black">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  {integration.comingSoon ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                      <span className="text-xs font-bold text-gray-600 uppercase">Coming Soon</span>
                    </div>
                  ) : isConfigured && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-bold text-green-600 uppercase">Active</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {integration.comingSoon ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm mb-2">This integration is coming soon!</p>
                      <p className="text-xs">Check back later or contact us for priority access.</p>
                    </div>
                  ) : (
                    integration.fields.map(field => {
                      const value = integrations[integration.id]?.[field.key] || '';
                      const passwordKey = `${integration.id}-${field.key}`;
                      const showPassword = showPasswords[passwordKey];

                      return (
                        <div key={field.key}>
                          <label className="minimal-label">
                            {field.label}
                          </label>
                          
                          {field.type === 'toggle' ? (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(e) => updateIntegration(integration.id, field.key, e.target.checked)}
                                className="w-5 h-5 text-black focus:ring-black"
                              />
                              <span className="text-sm text-gray-700">Enable integration</span>
                            </label>
                          ) : field.type === 'password' ? (
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={value}
                                onChange={(e) => updateIntegration(integration.id, field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="minimal-input pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => togglePassword(integration.id, field.key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              value={value}
                              onChange={(e) => updateIntegration(integration.id, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="minimal-input"
                            />
                          )}
                          
                          {field.help && (
                            <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Custom Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="minimal-card animate-pulse-shadow inline-block">
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-2">
              Need a custom integration?
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
              Contact us to add support for your specific tools and workflows
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="minimal-button-outline"
            >
              REQUEST INTEGRATION
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full"
        />
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}
