import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 60,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  text: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#333333',
    marginBottom: 10,
  },
  highlightBox: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
    padding: 15,
    marginVertical: 10,
  },
  promptBox: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    marginVertical: 10,
    fontFamily: 'Courier',
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginRight: 10,
  },
  timeSaved: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    padding: 8,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
});

interface PDFDocumentProps {
  profession: string;
  specialization: string;
  results?: any;
}

// PDF Document Component
const PDFContent = ({ profession, specialization, results }: PDFDocumentProps) => (
  <Document>
    {/* Cover Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <Text style={styles.logo}>OPTERO</Text>
        <Text style={styles.title}>Din Personliga AI-Guide</Text>
        <Text style={styles.subtitle}>Skräddarsydd för {specialization || profession}</Text>
        <Text style={styles.text}>Genererad {new Date().toLocaleDateString('sv-SE')}</Text>
        <Text style={styles.text}>28 sidor med konkreta AI-lösningar för ditt arbete</Text>
      </View>
    </Page>

    {/* Table of Contents */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>Innehållsförteckning</Text>
        <Text style={styles.text}>1. Sammanfattning & Quick Wins ..................... 3</Text>
        <Text style={styles.text}>2. Dina AI-verktyg i detalj ........................ 5</Text>
        <Text style={styles.text}>3. 4-veckors implementeringsplan ................... 12</Text>
        <Text style={styles.text}>4. Praktiska exempel från din vardag .............. 18</Text>
        <Text style={styles.text}>5. Färdiga prompts att kopiera .................... 22</Text>
        <Text style={styles.text}>6. Bonusmaterial & resurser ....................... 26</Text>
      </View>
    </Page>

    {/* Summary Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>1. Sammanfattning & Quick Wins</Text>
        
        <View style={styles.highlightBox}>
          <Text style={styles.subheading}>Din potential med AI</Text>
          <Text style={styles.text}>
            Som {specialization || profession} har du unika möjligheter att spara tid och förbättra kvaliteten i ditt arbete med AI. 
            Baserat på din profil har vi identifierat att du kan spara 5-8 timmar per vecka genom att implementera rätt AI-verktyg och arbetssätt.
          </Text>
        </View>

        <Text style={styles.subheading}>🎯 Dina största möjligheter</Text>
        <Text style={styles.text}>• Email & kommunikation: Reducera tiden med 70% genom AI-assisterad skrivning</Text>
        <Text style={styles.text}>• Rapportering: Automatisera dataanalys och rapportgenerering</Text>
        <Text style={styles.text}>• Dokumenthantering: Sammanfatta, analysera och skapa dokument 10x snabbare</Text>
        <Text style={styles.text}>• Möten: AI-genererade agendor, anteckningar och uppföljning</Text>

        <Text style={styles.subheading}>⚡ Quick Wins - Börja här!</Text>
        <View style={styles.checklistItem}>
          <View style={styles.checkbox} />
          <Text style={styles.text}>Installera ChatGPT och testa för första email-svaret</Text>
        </View>
        <View style={styles.checklistItem}>
          <View style={styles.checkbox} />
          <Text style={styles.text}>Använd AI för att sammanfatta nästa långa dokument</Text>
        </View>
        <View style={styles.checklistItem}>
          <View style={styles.checkbox} />
          <Text style={styles.text}>Låt AI skapa agendan för ditt nästa möte</Text>
        </View>
        <View style={styles.checklistItem}>
          <View style={styles.checkbox} />
          <Text style={styles.text}>Automatisera en återkommande rapport denna vecka</Text>
        </View>
      </View>
    </Page>

    {/* Add more pages as needed... */}
  </Document>
);

// Export component with download link
export default function PDFDocument({ profession, specialization, results }: PDFDocumentProps) {
  return (
    <PDFDownloadLink
      document={<PDFContent profession={profession} specialization={specialization} results={results} />}
      fileName={`AI-Guide-${specialization || profession}.pdf`}
      className="btn-primary inline-flex items-center gap-2"
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Genererar PDF...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Ladda ner PDF</span>
          </>
        )
      }
    </PDFDownloadLink>
  );
}
