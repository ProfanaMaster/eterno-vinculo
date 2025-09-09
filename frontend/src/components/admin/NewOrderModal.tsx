import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import Toast from '@/components/Toast';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  package_type: string;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function NewOrderModal({ isOpen, onClose, onSuccess }: NewOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info', isVisible: false });
  
  const [formData, setFormData] = useState({
    email: '',
    packageId: '',
    paymentMethod: '',
    referenceNumber: '',
    payerName: '',
    transferDate: '',
    transferAmount: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar paquetes disponibles
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get('/packages');
        setPackages(response.data.data || []);
      } catch (error) {
        // Error silencioso
      }
    };
    
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  // Buscar usuarios por email
  const searchUsers = async (email: string) => {
    if (email.length < 3) {
      setUserSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await api.get(`/admin/users/search?email=${encodeURIComponent(email)}`);
      setUserSuggestions(response.data.users || []);
      setShowSuggestions(true);
    } catch (error) {
      setUserSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setSelectedUser(null);
    setErrors(prev => ({ ...prev, email: '' }));
    
    if (value.length >= 3) {
      searchUsers(value);
    } else {
      setUserSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, email: user.email }));
    setShowSuggestions(false);
    setUserSuggestions([]);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedUser) {
      newErrors.email = 'Debes seleccionar un usuario válido';
    }

    if (!formData.packageId) {
      newErrors.packageId = 'Debes seleccionar un paquete';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Debes seleccionar un método de pago';
    }

    if (!formData.referenceNumber.trim()) {
      newErrors.referenceNumber = 'El número de referencia es requerido';
    }

    if (!formData.payerName.trim()) {
      newErrors.payerName = 'El nombre del pagador es requerido';
    }

    if (!formData.transferDate) {
      newErrors.transferDate = 'La fecha de transferencia es requerida';
    }

    if (!formData.transferAmount || parseFloat(formData.transferAmount) <= 0) {
      newErrors.transferAmount = 'El monto debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const selectedPackage = packages.find(p => p.id === formData.packageId);
      
      const orderData = {
        user_id: selectedUser!.id,
        package_id: formData.packageId,
        payment_method: formData.paymentMethod,
        payment_intent_id: formData.referenceNumber,
        total_amount: parseFloat(formData.transferAmount),
        currency: 'COP',
        status: 'completed',
        paid_at: new Date(formData.transferDate).toISOString(),
        payer_name: formData.payerName
      };

      await api.post('/admin/orders', orderData);
      
      // Mostrar toast de éxito
      setToast({ 
        message: '¡Orden creada exitosamente!', 
        type: 'success', 
        isVisible: true 
      });
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onSuccess();
        onClose();
        
        // Reset form
        setFormData({
          email: '',
          packageId: '',
          paymentMethod: '',
          referenceNumber: '',
          payerName: '',
          transferDate: '',
          transferAmount: ''
        });
        setSelectedUser(null);
        setErrors({});
        setToast({ message: '', type: 'info', isVisible: false });
      }, 1500);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al crear la orden';
      setErrors({ submit: errorMessage });
      
      // Mostrar toast de error
      setToast({ 
        message: errorMessage, 
        type: 'error', 
        isVisible: true 
      });
      
      // Ocultar toast después de 3 segundos
      setTimeout(() => {
        setToast({ message: '', type: 'info', isVisible: false });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nueva Orden</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email con autocompletado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Escribe el correo del usuario..."
                    autoComplete="off"
                  />
                  {searchingUsers && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  
                  {/* Sugerencias */}
                  {showSuggestions && userSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {userSuggestions.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => selectUser(user)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
                {selectedUser && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ Usuario seleccionado: {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                )}
              </div>

              {/* Paquete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paquete *
                </label>
                <select
                  value={formData.packageId}
                  onChange={(e) => handleInputChange('packageId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.packageId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Selecciona un paquete</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {formatCurrency(pkg.price)} ({pkg.package_type})
                    </option>
                  ))}
                </select>
                {errors.packageId && (
                  <p className="text-red-600 text-sm mt-1">{errors.packageId}</p>
                )}
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.paymentMethod ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Selecciona método de pago</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Transfiya">Transfiya</option>
                  <option value="Bancolombia">Bancolombia</option>
                </select>
                {errors.paymentMethod && (
                  <p className="text-red-600 text-sm mt-1">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Número de referencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de referencia *
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber}
                  onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.referenceNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Número de referencia de la transferencia"
                />
                {errors.referenceNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.referenceNumber}</p>
                )}
              </div>

              {/* Nombre del pagador */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del pagador *
                </label>
                <input
                  type="text"
                  value={formData.payerName}
                  onChange={(e) => handleInputChange('payerName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.payerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Nombre completo del pagador"
                />
                {errors.payerName && (
                  <p className="text-red-600 text-sm mt-1">{errors.payerName}</p>
                )}
              </div>

              {/* Fecha de transferencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de transferencia *
                </label>
                <input
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => handleInputChange('transferDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.transferDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.transferDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.transferDate}</p>
                )}
              </div>

              {/* Monto transferido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto transferido *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={formData.transferAmount}
                  onChange={(e) => handleInputChange('transferAmount', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors.transferAmount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="0"
                  min="0"
                  step="100"
                />
                {errors.transferAmount && (
                  <p className="text-red-600 text-sm mt-1">{errors.transferAmount}</p>
                )}
              </div>

              {/* Error general */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Orden'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      
      {/* Toast de notificación */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </AnimatePresence>
  );
}

export default NewOrderModal;
