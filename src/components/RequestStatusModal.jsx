import { useState, useEffect } from 'react';
import { depositAPI, walletAPI, userAPI } from '../services/api';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

const RequestStatusModal = ({ isOpen, onClose, type, requestId, title }) => {
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !requestId) return;

    const checkStatus = async () => {
      try {
        let foundStatus = null;
        if (type === 'DEPOSIT') {
          const res = await depositAPI.getHistory();
          const request = (res?.data || res || []).find(d => d.id === requestId);
          if (request) foundStatus = request.status;
        } else if (type === 'JTOKEN') {
          const res = await walletAPI.getJTokenHistory();
          const request = (res?.data || res || []).find(d => d.id === requestId);
          if (request) foundStatus = request.status;
        } else if (type === 'WITHDRAWAL') {
          const res = await walletAPI.getWithdrawalHistory();
          const request = (res?.data || res || []).find(w => w.id === requestId);
          if (request) foundStatus = request.status;
        } else if (type === 'EXCHANGE') {
          const res = await userAPI.getMyExchangeRequests();
          const requests = res?.data?.requests || res?.requests || res || [];
          const request = requests.find(e => e.id === requestId);
          if (request) foundStatus = request.status;
        }
        
        if (foundStatus) {
          setStatus(foundStatus);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1500);

    return () => clearInterval(interval);
  }, [isOpen, requestId, type]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const getStatusColor = () => {
    if (status === 'APPROVED' || status === 'COMPLETED') return 'text-emerald-400';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusMessage = () => {
    if (status === 'APPROVED' || status === 'COMPLETED') return 'Success!';
    if (status === 'REJECTED' || status === 'CANCELLED') return 'Request Rejected';
    return 'Waiting for approval...';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl border border-[#D4AF37]/30 bg-[#0d0d0d] p-8 text-center">
        <div className="flex justify-center mb-6">
          {status === 'PENDING' ? (
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <FaSpinner className="w-10 h-10 text-yellow-400 animate-spin" />
            </div>
          ) : status === 'APPROVED' || status === 'COMPLETED' ? (
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <FaCheck className="w-10 h-10 text-green-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <FaTimes className="w-10 h-10 text-red-400" />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className={`text-lg font-semibold mb-4 ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>

        {status === 'PENDING' ? (
          <p className="text-gray-400 text-sm">Please wait 3-5 minutes, your request will be reviewed...</p>
        ) : (
          <p className="text-gray-400 text-sm mb-4">
            {type === 'EXCHANGE' && (status === 'APPROVED' || status === 'COMPLETED') 
              ? 'Your INR balance has been updated!' 
              : 'Your balance has been updated!'}
          </p>
        )}

        {status !== 'PENDING' && (
          <button
            onClick={handleClose}
            className="mt-4 w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold rounded-xl"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestStatusModal;
