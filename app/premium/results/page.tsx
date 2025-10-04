"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { useLanguage } from "@/contexts/LanguageContext";
import ChatCoach from "@/components/ChatCoach";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#111827",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 1.6,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 5,
    paddingLeft: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 10,
  },
});

// PDF Document Component
const PremiumPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Din Personliga AI-Guide</Text>
        <Text style={styles.subtitle}>
          {data.profession} - {data.specialization}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sammanfattning</Text>
        <Text style={styles.text}>
          Baserat på din djupgående analys har vi identifierat {data.tools.length} AI-verktyg 
          som kan spara dig {data.totalTimeSaved} timmar per vecka. Denna guide innehåller 
          detaljerade instruktioner för implementation och användning.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dina Utmaningar</Text>
        {data.challenges.map((challenge: string, index: number) => (
          <Text key={index} style={styles.listItem}>
            • {challenge}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rekommenderade AI-Verktyg</Text>
        {data.tools.map((tool: any, index: number) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={styles.subsectionTitle}>{tool.name}</Text>
            <Text style={styles.text}>{tool.description}</Text>
            <Text style={styles.text}>Tidsbesparning: {tool.timeSaved}</Text>
            <Text style={styles.text}>Implementation: {tool.implementation}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        © 2024 Mendio - Din personliga AI-guide
      </Text>
    </Page>
  </Document>
);

export default function PremiumResultsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [premiumData, setPremiumData] = useState<any>(null);

  useEffect(() => {
    // Check if user has access
    const hasPurchased = sessionStorage.getItem("premiumPurchased");
    const interviewData = sessionStorage.getItem("premiumInterviewData");
    
    if (!hasPurchased || !interviewData) {
      router.push("/");
      return;
    }

    // Generate premium results
    generatePremiumResults(JSON.parse(interviewData));
  }, []);

  const generatePremiumResults = async (interviewData: any) => {
    try {
      const response = await fetch("/api/premium/generate-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewData),
      });

      if (response.ok) {
        const data = await response.json();
        setPremiumData(data);
      }
    } catch (error) {
      console.error("Failed to generate results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Skapar din personliga guide...</p>
        </div>
      </div>
    );
  }

  if (!premiumData) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Success banner */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-800 font-medium">
              Din personliga AI-guide är klar!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with PDF download */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Din Kompletta AI-Guide
            </h1>
            <p className="text-gray-600">
              Skräddarsydd för {premiumData.profession} - {premiumData.specialization}
            </p>
          </div>
          
          <PDFDownloadLink
            document={<PremiumPDF data={premiumData} />}
            fileName={`AI-Guide-${premiumData.profession}.pdf`}
            className="btn-primary flex items-center gap-2"
          >
            {({ loading }) => (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {loading ? "Förbereder PDF..." : "Ladda ner PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">Total tidsbesparing</p>
            <p className="text-3xl font-bold text-gray-900">{premiumData.totalTimeSaved}h/vecka</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">AI-verktyg</p>
            <p className="text-3xl font-bold text-gray-900">{premiumData.tools.length} st</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">ROI på investering</p>
            <p className="text-3xl font-bold text-green-600">{premiumData.roi}%</p>
          </div>
        </div>

        {/* Detailed sections */}
        <div className="space-y-8">
          {/* Challenges and solutions */}
          <section className="bg-white rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Dina Utmaningar & Lösningar
            </h2>
            <div className="space-y-6">
              {premiumData.challengeSolutions.map((item: any, index: number) => (
                <div key={index} className="border-l-4 border-gray-900 pl-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.challenge}
                  </h3>
                  <p className="text-gray-600 mb-3">{item.solution}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tools.map((tool: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed tool recommendations */}
          <section className="bg-white rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              AI-Verktyg i Detalj
            </h2>
            <div className="grid gap-6">
              {premiumData.tools.map((tool: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-gray-600">{tool.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Sparar {tool.timeSaved}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Så här använder du det:</p>
                      <p className="text-gray-600">{tool.howToUse}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Konkreta exempel:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {tool.examples.map((example: string, i: number) => (
                          <li key={i} className="text-gray-600">{example}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Tips:</p>
                      <p className="text-gray-600">{tool.tips}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      Testa verktyget →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Implementation plan */}
          <section className="bg-white rounded-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Din 4-veckors Implementeringsplan
            </h2>
            <div className="space-y-6">
              {premiumData.implementationPlan.map((week: any, index: number) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-24">
                    <div className="bg-gray-900 text-white rounded-lg p-3 text-center">
                      <p className="text-sm font-medium">Vecka {index + 1}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{week.focus}</h3>
                    <ul className="space-y-2">
                      {week.tasks.map((task: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA section */}
        <div className="mt-12 bg-gray-900 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Redo att börja?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Du har nu all information du behöver för att revolutionera din arbetsdag med AI. 
            Börja med vecka 1 och följ planen steg för steg.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Tillbaka till startsidan
            </button>
            <PDFDownloadLink
              document={<PremiumPDF data={premiumData} />}
              fileName={`AI-Guide-${premiumData.profession}.pdf`}
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Ladda ner PDF igen
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* AI Coach Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-8 right-8 bg-gray-900 text-white rounded-full p-4 shadow-2xl hover:bg-gray-800 transition-all transform hover:scale-110 group"
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Prata med din AI-Coach
          </span>
        </button>
      )}

      {/* AI Coach Chat */}
      {showChat && premiumData && (
        <ChatCoach
          userContext={{
            type: "consumer",
            profession: premiumData.profession,
            specialization: premiumData.specialization,
            tasks: premiumData.tasks,
            challenges: premiumData.challenges
          }}
          onClose={() => setShowChat(false)}
        />
      )}
    </main>
  );
}