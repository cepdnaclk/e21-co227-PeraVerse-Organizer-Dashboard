import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { isAuthenticated } from "../../../utils/auth";

interface Alert {
  alert_id: number;
  alert: string;
  sent_by: string;
  sent_at: string;
}

const AlertWidget: React.FC = () => {
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check authentication and fetch alerts when component mounts
  useEffect(() => {
    let isCancelled = false;
    
    const loadAlerts = async () => {
      if (!isAuthenticated()) {
        if (!isCancelled) {
          setError('Please login to access alerts');
        }
        return;
      }
      
      if (!isCancelled) {
        setLoading(true);
      }
      
      try {
        const response = await fetch('http://localhost:3001/alerts', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (isCancelled) return;
        
        if (response.ok) {
          const data = await response.json();
          setAlerts(data);
        } else if (response.status === 401) {
          setError('Session expired. Please login again.');
          // Don't redirect immediately to prevent loops
        } else {
          setError('Failed to fetch alerts');
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
        if (!isCancelled) {
          setError('Failed to fetch alerts. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadAlerts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/alerts', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      } else {
        setError('Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to fetch alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    if (!alertMessage.trim()) {
      setError('Please enter an alert message');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3001/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          alert: alertMessage,
          sent_at: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Alert sent successfully!');
        setAlertMessage('');
        // Refresh alerts list
        fetchAlerts();
      } else {
        setError(result.error || 'Failed to send alert');
      }
    } catch (error) {
      console.error('Error sending alert:', error);
      setError('Failed to send alert. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAlert();
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Alert Input Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
            <MessageSquare size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Send New Alert</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="alertMessage" className="block text-sm font-medium text-gray-700 mb-2">
              Alert Message
            </label>
            <textarea
              id="alertMessage"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your alert message here..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {alertMessage.length}/500 characters
            </div>
          </div>

          <button
            onClick={sendAlert}
            disabled={sending || !alertMessage.trim()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {sending ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Alert</span>
              </>
            )}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Alerts</h3>
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader size={24} className="animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading alerts...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p>No alerts found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    Alert #{alert.alert_id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(alert.sent_at)}
                  </span>
                </div>
                <p className="text-gray-800 mb-2">{alert.alert}</p>
                <div className="text-xs text-gray-600">
                  Sent by: {alert.sent_by}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertWidget;