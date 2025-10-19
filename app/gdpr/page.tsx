"use client";

import Link from "next/link";
import { Shield, Download, Trash2, Lock, Eye, Edit, FileText } from "lucide-react";

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-gray-900" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900">
              GDPR RIGHTS
            </h1>
          </div>
          <p className="text-xl sm:text-2xl text-gray-600 font-light">
            Manage your personal data and privacy rights
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Introduction */}
        <div className="card p-8 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            Under the General Data Protection Regulation (GDPR), you have several rights regarding your personal data.
            Below you can exercise these rights or read more about what data we collect and how we use it.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link 
            href="/gdpr/exportera-data" 
            className="card p-6 hover:shadow-lg transition-all group border-2 border-transparent hover:border-gray-900"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-900 transition-colors">
                <Download className="w-6 h-6 text-gray-900 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Export your data</h3>
                <p className="text-gray-600 text-sm">
                  Download all data we have about you in a machine-readable format (JSON).
                </p>
              </div>
            </div>
          </Link>

          <Link 
            href="/gdpr/radera-data" 
            className="card p-6 hover:shadow-lg transition-all group border-2 border-transparent hover:border-red-600"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-600 transition-colors">
                <Trash2 className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete your data</h3>
                <p className="text-gray-600 text-sm">
                  Permanently delete all data associated with your email address.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Your GDPR Rights */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="w-7 h-7" />
            Your GDPR Rights
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Right of Access</h3>
                <p className="text-gray-600 text-sm">
                  You can request access to all personal data we have about you and how it's being used.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Right to Rectification</h3>
                <p className="text-gray-600 text-sm">
                  You can request correction of inaccurate or incomplete personal data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Right to Erasure</h3>
                <p className="text-gray-600 text-sm">
                  You can request deletion of your personal data (the "right to be forgotten").
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Right to Data Portability</h3>
                <p className="text-gray-600 text-sm">
                  You can receive your personal data in a structured, commonly used format.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Right to Restriction</h3>
                <p className="text-gray-600 text-sm">
                  You can request that we restrict the processing of your personal data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Right to Object</h3>
                <p className="text-gray-600 text-sm">
                  You can object to certain types of processing of your personal data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact and Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              For questions about your data or to exercise rights not covered by our self-service tools, contact us:
            </p>
            <a 
              href="mailto:ch.genberg@gmail.com" 
              className="text-gray-900 underline text-sm font-medium"
            >
              ch.genberg@gmail.com
            </a>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Read more</h3>
            <div className="space-y-2">
              <Link 
                href="/integritetspolicy" 
                className="block text-gray-600 hover:text-gray-900 text-sm hover:underline"
              >
                → Privacy Policy
              </Link>
              <Link 
                href="/contact" 
                className="block text-gray-600 hover:text-gray-900 text-sm hover:underline"
              >
                → Contact Data Protection Officer
              </Link>
            </div>
          </div>
        </div>

        {/* Response Time Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Response Time:</strong> We will respond to your request within 30 days as required by GDPR.
            For export and delete requests using our self-service tools, the process is immediate.
          </p>
        </div>
      </div>
    </div>
  );
}


