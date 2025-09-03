import React from 'react';
import { 
  calculateMemorialTime, 
  getTimeWithUsMessage, 
  getTimeWithoutYouMessage,
  type MemorialTimeInfo 
} from '@/services/timeCalculationService';

interface MemorialTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  birthDate: string;
  deathDate: string;
}

export const MemorialTimeModal: React.FC<MemorialTimeModalProps> = ({
  isOpen,
  onClose,
  profileName,
  birthDate,
  deathDate
}) => {
  if (!isOpen) return null;

  const timeInfo: MemorialTimeInfo = calculateMemorialTime(birthDate, deathDate);
  const timeWithUsMessage = getTimeWithUsMessage(timeInfo.timeWithUs);
  const timeWithoutYouMessage = getTimeWithoutYouMessage(timeInfo.timeWithoutYou);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-6 rounded-t-2xl border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">⏰</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Datos no menos relevantes
                  </h2>
                  <p className="text-gray-600">Tiempo que compartimos y tiempo sin ti</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Tiempo que estuvo con nosotros */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💚</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800">
                  Tiempo que estuvo con nosotros
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {timeInfo.timeWithUs.years}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    {timeInfo.timeWithUs.years === 1 ? 'Año' : 'Años'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {timeInfo.timeWithUs.months}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    {timeInfo.timeWithUs.months === 1 ? 'Mes' : 'Meses'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {timeInfo.timeWithUs.days}
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    {timeInfo.timeWithUs.days === 1 ? 'Día' : 'Días'}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-medium text-green-800 mb-2">
                  Total: {timeInfo.formattedTimeWithUs}
                </div>
                <p className="text-green-700 italic">
                  {timeWithUsMessage}
                </p>
              </div>
            </div>

            {/* Tiempo sin esa persona */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💙</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-800">
                  Tiempo sin ti, {profileName}
                </h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {timeInfo.timeWithoutYou.years}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    {timeInfo.timeWithoutYou.years === 1 ? 'Año' : 'Años'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {timeInfo.timeWithoutYou.months}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    {timeInfo.timeWithoutYou.months === 1 ? 'Mes' : 'Meses'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {timeInfo.timeWithoutYou.days}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    {timeInfo.timeWithoutYou.days === 1 ? 'Día' : 'Días'}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-medium text-blue-800 mb-2">
                  Total: {timeInfo.formattedTimeWithoutYou}
                </div>
                <p className="text-blue-700 italic">
                  {timeWithoutYouMessage}
                </p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-purple-800">
                  Detalles adicionales
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {timeInfo.timeWithUs.totalDays}
                  </div>
                  <div className="text-sm text-purple-700">
                    Días totales con nosotros
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {timeInfo.timeWithoutYou.totalDays}
                  </div>
                  <div className="text-sm text-purple-700">
                    Días sin ti
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                "El tiempo que compartimos es eterno, y cada día sin ti nos recuerda lo afortunados que fuimos de tenerte"
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
