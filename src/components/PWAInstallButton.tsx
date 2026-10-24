import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';
import { AndroidInstallModal } from './AndroidInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
          variant === 'full'
            ? 'w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs text-xs justify-center'
            : 'px-2.5 py-1 bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-[10px]'
        } ${className}`}
        title="Install on Android / Google Play / Expo"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
        <span>{isInstalled ? 'Android Setup' : 'Install on Android'}</span>
      </button>

      <AndroidInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
