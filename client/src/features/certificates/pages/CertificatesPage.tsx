import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import type { Certificate } from '@/types';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/interviews/certificates/')
      .then((res) => {
        const data = res.data.results || res.data;
        const validData = Array.isArray(data) ? data : [];
        setCertificates(validData);
        if (validData.length > 0) setSelectedCert(validData[0]);
      })
      .catch(() => {
        setCertificates([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadPDF = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate_${selectedCert?.unique_id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const verificationUrl = selectedCert ? `${window.location.origin}/verify/${selectedCert.unique_id}` : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Award size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Certificates</h1>
          <p className="text-muted-foreground mt-1">View and download your earned achievements</p>
        </div>
      </motion.div>

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground animate-pulse">Loading certificates...</Card>
      ) : certificates.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">You haven't earned any certificates yet. Complete interviews with a score of 70%+ to earn one!</Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-bold text-foreground mb-4">Your Certificates</h3>
            {certificates.map((cert) => (
              <div 
                key={cert.id} 
                onClick={() => setSelectedCert(cert)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedCert?.id === cert.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-500/30' : 'bg-card border-border hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Award size={20} className={selectedCert?.id === cert.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'} />
                  <h4 className="font-semibold text-foreground capitalize">{cert.interview_type} Interview</h4>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Score: {cert.overall_score.toFixed(1)}%</span>
                  <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedCert && (
              <Card className="p-6 bg-muted/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-foreground">Certificate Preview</h3>
                  <Btn onClick={downloadPDF}><Download size={16} /> Download PDF</Btn>
                </div>
                
                {/* Certificate DOM for HTML2Canvas */}
                <div className="overflow-x-auto pb-4">
                  <div 
                    ref={certRef}
                    className="w-[800px] h-[565px] bg-white relative mx-auto shadow-2xl p-12 border-[12px] border-double border-indigo-900"
                    style={{ fontFamily: "'Inter', sans-serif", color: '#1e1b4b' }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
                      <Award size={600} />
                    </div>
                    
                    <div className="relative z-10 text-center space-y-6 flex flex-col h-full justify-center">
                      <h1 className="text-5xl font-black uppercase tracking-widest text-indigo-900">Certificate</h1>
                      <h2 className="text-2xl font-light tracking-widest text-indigo-700">OF ACHIEVEMENT</h2>
                      
                      <div className="my-8">
                        <p className="text-gray-500 uppercase tracking-widest text-sm mb-4">This is proudly presented to</p>
                        <p className="text-4xl font-bold text-gray-900 italic font-serif">{selectedCert.candidate_name}</p>
                        <div className="w-64 h-px bg-indigo-200 mx-auto mt-2"></div>
                      </div>
                      
                      <div className="max-w-lg mx-auto">
                        <p className="text-gray-600 leading-relaxed">
                          For successfully completing the <span className="font-bold capitalize">{selectedCert.interview_type}</span> interview assessment with an outstanding overall score of <span className="font-bold text-indigo-600">{selectedCert.overall_score.toFixed(1)}%</span>.
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end mt-12 pt-8">
                        <div className="text-left">
                          <p className="text-gray-900 font-bold mb-1">Smart AI Platform</p>
                          <div className="w-32 h-px bg-gray-300 mb-1"></div>
                          <p className="text-xs text-gray-500 uppercase">Authorized Issuer</p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <QRCodeSVG value={verificationUrl} size={80} level="M" />
                          <p className="text-[10px] text-gray-400 mt-2">Verify: {selectedCert.unique_id}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-gray-900 font-bold mb-1">{new Date(selectedCert.issue_date).toLocaleDateString()}</p>
                          <div className="w-32 h-px bg-gray-300 mb-1 ml-auto"></div>
                          <p className="text-xs text-gray-500 uppercase">Date of Issue</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
