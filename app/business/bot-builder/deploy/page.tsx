"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallationGuideButton } from "@/components/InstallationGuide";

export default function DeployBot() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const [installSnippet, setInstallSnippet] = useState<string>("");

  useEffect(() => {
    const id = sessionStorage.getItem('botBuilder_botId') || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const src = `${origin}/widget.js`;
    const snippet = `<!-- Mendio Bot Widget -->\n<script async src="${src}" data-bot-id="${id}"></script>`;
    setInstallSnippet(snippet);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(installSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="minimal-box">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Install on your website
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <h3 className="font-medium text-gray-900">Copy the code</h3>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-50 rounded-xl p-6 overflow-x-auto text-sm font-mono text-gray-700">
{installSnippet}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <h3 className="font-medium text-gray-900">Paste before &lt;/head&gt;</h3>
              </div>
              
              <p className="text-gray-600">
                Open your website HTML and paste the code just before the closing <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;/head&gt;</code> tag.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <h3 className="font-medium text-gray-900">All set!</h3>
              </div>
              
              <p className="text-gray-600">
                Your bot will automatically appear on all pages. Visitors can chat by clicking the bot icon.
              </p>
            </div>

            {/* Platform specific guides */}
            <div className="border-t pt-8">
              <h3 className="font-medium text-gray-900 mb-4">Need help?</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InstallationGuideButton platform="wordpress" snippet={installSnippet} />
                <InstallationGuideButton platform="wix" snippet={installSnippet} />
                <InstallationGuideButton platform="squarespace" snippet={installSnippet} />
                <InstallationGuideButton platform="other" snippet={installSnippet} />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={() => router.push("/business/bot-builder/solution")}
              className="btn-minimal-outline"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
