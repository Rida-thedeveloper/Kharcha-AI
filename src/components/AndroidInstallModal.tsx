import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, ExternalLink, X, Copy, QrCode, Play } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'playstore' | 'expo'>('direct');
  const [copied, setCopied] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  const currentUrl = window.location.origin;

  const expoCodeSnippet = `// App.js for Expo Go (React Native)
// 1. Run: npx create-expo-app kharcha-mobile && cd kharcha-mobile
// 2. Run: npx expo install react-native-webview
// 3. Paste this code into App.js and run: npx expo start

import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />
      <WebView
        source={{ uri: '${currentUrl}' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});`;

  const handleCopyExpo = () => {
    navigator.clipboard.writeText(expoCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 text-stone-900 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 leading-tight">
                Android &amp; Play Store Setup
              </h3>
              <p className="text-[11px] text-stone-500">
                Run on your phone via Direct Install, Play Store (TWA), or Expo Go
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl my-3 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            1. Direct Android Install
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('playstore')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'playstore'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            2. Google Play Store
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expo')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              activeTab === 'expo'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            3. Expo Go (Mobile)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {activeTab === 'direct' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="font-bold text-emerald-950 block text-xs">
                  ⚡ Asani se Mobile par Install karein (No Play Store needed)
                </span>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Yeh app Progressive Web App (PWA) configured hai. Aapke Android mobile par yeh bilkul native Android app ki tarah save hoti hai.
                </p>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      onClose();
                    }}
                    className="mt-3 w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Kharcha AI on this Device</span>
                  </button>
                ) : (
                  <div className="mt-2.5 p-2 bg-white/80 rounded-xl border border-emerald-200/80 text-[11px] text-stone-700 space-y-1">
                    <p className="font-semibold text-emerald-900">Mobile Chrome par kaisey install karein:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-stone-600">
                      <li>Mobile Chrome browser mein yeh URL kholein.</li>
                      <li>Chrome menu (<strong>⋮</strong> three dots) par tap karein.</li>
                      <li><strong>&ldquo;Add to Home screen&rdquo;</strong> ya <strong>&ldquo;Install app&rdquo;</strong> select karein.</li>
                      <li>Kharcha AI aapke phone ke app drawer mein aa jayegi!</li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-800 block text-xs">
                  Live App URL:
                </span>
                <div className="p-2 bg-white rounded-lg border border-stone-200 font-mono text-[11px] text-stone-700 break-all select-all">
                  {currentUrl}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playstore' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-900 block text-xs">
                  Google Play Store Publishing (TWA / APK / AAB)
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Google officially allows web apps with compliant Web App Manifests to be uploaded to Google Play Store using <strong>Trusted Web Activity (TWA)</strong>.
                </p>

                <div className="space-y-2 mt-2">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-emerald-900 block text-[11px]">
                      Method 1: PWABuilder (Easiest - 1 Click)
                    </span>
                    <p className="text-[10px] text-stone-600 mt-0.5">
                      1. Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">PWABuilder.com</a><br />
                      2. Paste your live URL: <code className="bg-stone-100 px-1 rounded">{currentUrl}</code><br />
                      3. Click <strong>Package for Stores</strong> &rarr; <strong>Android (Google Play)</strong>.<br />
                      4. Download your signed <code className="bg-stone-100 px-1 rounded">.aab</code> bundle and upload it to Google Play Console.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                    <span className="font-bold text-stone-900 block text-[11px]">
                      Method 2: Google's Official Bubblewrap CLI
                    </span>
                    <p className="text-[10px] text-stone-600 mt-0.5 font-mono bg-stone-900 text-stone-200 p-2 rounded-lg">
                      npm i -g @bubblewrap/cli<br />
                      bubblewrap init --manifest={currentUrl}/manifest.webmanifest<br />
                      bubblewrap build
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expo' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">
                    Expo Go App Wrapper (React Native)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyExpo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy App.js'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Agar aapko Expo Go ke zariye phone par chalana hai, toh Expo project bana kar <code className="bg-stone-200/80 px-1 py-0.5 rounded text-[10px]">react-native-webview</code> use karein:
                </p>

                <div className="p-2 bg-stone-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto">
                  <pre>{expoCodeSnippet}</pre>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                  <span className="font-bold block">Steps to run in Expo Go:</span>
                  <ol className="list-decimal list-inside space-y-0.5 text-stone-600 text-[10px]">
                    <li>Terminal mein run karein: <code className="bg-white px-1 rounded">npx create-expo-app kharcha-app</code></li>
                    <li><code className="bg-white px-1 rounded">npx expo install react-native-webview</code></li>
                    <li>Copy button daba kar <code className="bg-white px-1 rounded">App.js</code> replace karein.</li>
                    <li><code className="bg-white px-1 rounded">npx expo start</code> run karein aur phone se QR scan karein!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-stone-400 font-mono">
            PWA / Play Store / Expo Ready
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
