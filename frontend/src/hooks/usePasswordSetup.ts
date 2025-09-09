import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function usePasswordSetup() {
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.user_metadata?.needs_password_setup) {
      setNeedsPasswordSetup(true);
      setShowModal(true);
    }
  }, [user]);

  const handlePasswordSet = () => {
    setNeedsPasswordSetup(false);
    setShowModal(false);
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  return {
    needsPasswordSetup,
    showModal,
    handlePasswordSet,
    handleSkip
  };
}
