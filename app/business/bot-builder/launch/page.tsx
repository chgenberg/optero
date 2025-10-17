"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Copy, 
  Code,
  MessageSquare,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Home
} from "lucide-react";
import Stepper from "@/components/Stepper";

export default function LaunchBotPage() {
  const router = useRouter();
  const [botType, setBotType] = useState('support');
  const [isHeadless, setIsHeadless] = useState(false);
  const [hasIntegrations, setHasIntegrations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [botId, setBotId] = useState('');

  // Build embed code using state only (no window/sessionStorage here)
  const embedCode = `<script>\n  (function() {\n    const script = document.createElement('script');\n    script.src = 'https://myaiguy.com/widget.js';\n    script.setAttribute('data-bot-id', '${botId}');\n    script.async = true;\n    document.head.appendChild(script);\n  })();\n</script>`;

  useEffect(() => {
    // Access sessionStorage only on client
    const storedType = typeof window !== 'undefined' ? (sessionStorage.getItem('selectedBotType') || 'support') : 'support';
    setBotType(storedType);

    const storedHasIntegrations = typeof window !== 'undefined' ? (sessionStorage.getItem('hasIntegrations') === 'true') : false;
    setHasIntegrations(storedHasIntegrations);
    setIsHeadless(storedHasIntegrations || storedType === 'workflow');

    // Generate mock bot ID
    setBotId('bot_' + Math.random().toString(36).substr(2, 9));
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToDashboard = () => {
    // In a real app, this would navigate to the bot's dashboard page
    router.push(`/dashboard/${botId}`);
  };

  const handleChatWithBot = () => {
    // In a real app, this would navigate to the bot's chat interface
    router.push(`/dashboard/${botId}/chat`);
  };

  const checklistItems = [
    { label: 'Bot type selected', completed: true },
    { label: 'Customization complete', completed: true },
    { label: 'Integrations configured', completed: hasIntegrations },
    { label: 'Bot tested', completed: true },
    { label: 'Ready to launch', completed: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Stepper currentStep={5} steps={['Overview', 'Choose', 'Customize', 'Integrations', 'Test', 'Launch']} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-black mb-4">
            Your Bot is Ready!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Congratulations! Your {botType} bot has been successfully created and configured.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Checklist */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
          >
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Setup Complete
            </h3>
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className={`w-5 h-5 ${item.completed ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={`text-sm ${item.completed ? 'text-black' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How to Use */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
          >
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              How to Use Your Bot
            </h3>
            
            {isHeadless ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Your bot is configured as a headless bot with system integrations. 
                  It runs directly on our platform without needing to be embedded on your website.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 mb-2">CONNECTED SYSTEMS:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white rounded text-xs text-gray-700">Zendesk</span>
                    <span className="px-2 py-1 bg-white rounded text-xs text-gray-700">HubSpot</span>
                  </div>
                </div>
                <motion.button
                  onClick={handleChatWithBot}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full minimal-button flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat with Your Bot
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add this code to your website to make your bot available to visitors.
                </p>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{embedCode}</code>
                  </pre>
                  <button
                    onClick={handleCopyCode}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Add this code just before the closing &lt;/body&gt; tag on your website.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={handleGoToDashboard}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button flex items-center justify-center gap-2 px-8"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="minimal-button-outline flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
