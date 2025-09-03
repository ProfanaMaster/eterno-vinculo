import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface CaptchaProps {
  onCaptchaChange: (captchaId: string, captchaInput: string) => void;
  className?: string;
}

interface CaptchaData {
  captchaId: string;
  svg: string;
}

const Captcha = ({ onCaptchaChange, className = '' }: CaptchaProps) => {
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCaptcha = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/memories/captcha');
      const newCaptcha = response.data.data;
      setCaptcha(newCaptcha);
      setInput('');
      onCaptchaChange(newCaptcha.captchaId, '');
    } catch (error) {
      setError('Error generando captcha');
      console.error('Error generando captcha:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (captcha) {
      onCaptchaChange(captcha.captchaId, value);
    }
  };

  const handleRefresh = () => {
    generateCaptcha();
  };

  if (!captcha) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Verificación de seguridad
      </label>
      
      <div className="flex items-center space-x-3">
        {/* Captcha SVG */}
        <div className="flex-shrink-0">
          <div 
            className="bg-gray-50 p-2 rounded border"
            dangerouslySetInnerHTML={{ __html: captcha.svg }}
          />
        </div>
        
        {/* Input y botón de refresh */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Ingresa el código"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            maxLength={4}
          />
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generando...' : '🔄 Nuevo código'}
            </button>
            
            {error && (
              <span className="text-sm text-red-600">{error}</span>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Ingresa los caracteres que ves en la imagen para verificar que eres humano
      </p>
    </div>
  );
};

export default Captcha;
