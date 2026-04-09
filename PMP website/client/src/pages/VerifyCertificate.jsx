import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldX, GraduationCap } from 'lucide-react';
import api from '../api/axiosInstance';

export default function VerifyCertificate() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/verify/${token}`)
      .then((res) => setResult(res.data))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-600 mt-2">PMP Learn - Certificate Verification</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          {result?.valid ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">Certificate Verified</h1>
              <p className="text-gray-600 mb-6">This certificate is authentic and valid.</p>
              <div className="text-left space-y-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Recipient</p>
                  <p className="text-sm font-medium text-gray-900">{result.recipientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Exam</p>
                  <p className="text-sm font-medium text-gray-900">{result.examTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Score</p>
                  <p className="text-sm font-medium text-gray-900">{result.score}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Issued On</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(result.issuedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldX className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Certificate</h1>
              <p className="text-gray-600">This certificate could not be verified. It may be invalid or revoked.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
