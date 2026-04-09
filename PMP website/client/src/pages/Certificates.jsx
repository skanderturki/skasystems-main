import { useState, useEffect } from 'react';
import { Award, Download, ExternalLink } from 'lucide-react';
import api from '../api/axiosInstance';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates')
      .then((res) => setCertificates(res.data.certificates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-600 mt-1">Your earned certifications with verifiable QR codes.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No certificates yet</h2>
          <p className="text-gray-600">Pass a certification exam with 80% or higher to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{cert.examTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cert.recipientName}</p>
                  <p className="text-xs text-gray-500 mt-1">Certificate #{cert.certificateNumber}</p>
                  <p className="text-xs text-gray-500">Score: {cert.score}%</p>
                  <p className="text-xs text-gray-500">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <a
                  href={`/api/certificates/${cert._id}/download`}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <a
                  href={`/verify/${cert.verificationToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Verify
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
