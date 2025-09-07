import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface MemorialFooterProps {
  className?: string;
}

const MemorialFooter = ({ className = '' }: MemorialFooterProps) => {
  const { settings } = useSettings();
  const footerSettings = settings.footer_info || {};
  
  // Obtener el número de teléfono del footer
  const phoneNumber = footerSettings.phone;
  
  // Limpiar el número de teléfono (remover espacios, guiones, paréntesis)
  const cleanPhoneNumber = phoneNumber ? phoneNumber.replace(/[\s\-\(\)]/g, '') : '';
  
  // Agregar código de país si no lo tiene
  const formattedPhoneNumber = cleanPhoneNumber.startsWith('+') 
    ? cleanPhoneNumber 
    : cleanPhoneNumber.startsWith('57') 
      ? `+${cleanPhoneNumber}`
      : `+57${cleanPhoneNumber}`;
  return (
    <div className={`mt-12 pt-8 border-t border-gray-200/50 ${className}`}>
      <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100/50 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/30 via-amber-300/30 to-yellow-400/30 rounded-t-xl"></div>
        
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent tracking-wide">
              Eterno Vínculo
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              Honra la memoria de tus seres queridos
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500 mb-3">
            <span>© 2024 Eterno Vínculo</span>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://www.eternovinculo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 transition-colors duration-200 font-medium text-sm"
            >
              Página Principal
            </a>
            {phoneNumber && (
              <a 
                href={`https://wa.me/${formattedPhoneNumber}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 transition-colors duration-200 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
          
          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-2 text-amber-600/70">
              <span className="text-xs font-medium tracking-wider">CREANDO LEGADOS DIGITALES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorialFooter;
