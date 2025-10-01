'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
        applyConsent(saved);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const applyConsent = (prefs: typeof preferences) => {
    // Enable/disable analytics scripts based on consent
    if (prefs.analytics) {
      // Enable Google Analytics or other analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    } else {
      // Disable analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
    }

    // Enable/disable marketing scripts based on consent
    if (prefs.marketing) {
      // Enable marketing pixels, social media scripts, etc.
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted'
        });
      }
    } else {
      // Disable marketing
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    applyConsent(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    applyConsent(onlyNecessary);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    applyConsent(preferences);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const togglePreference = (key: 'analytics' | 'marketing') => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-card border-2 border-primary rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        {!showPreferences ? (
          // Main consent banner
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl mb-2 text-foreground">
                  We Value Your Privacy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
              <button
                onClick={handleRejectAll}
                className="flex-shrink-0 p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 px-6 py-3 border-2 border-border rounded-full font-medium hover:bg-secondary transition-colors text-foreground"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 px-6 py-3 border-2 border-border rounded-full font-medium hover:bg-secondary transition-colors text-foreground"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-accent transition-colors"
              >
                Accept All
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Read our{' '}
              <a href="/privacy-policy" className="underline hover:text-foreground">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/cookie-policy" className="underline hover:text-foreground">
                Cookie Policy
              </a>
            </p>
          </div>
        ) : (
          // Preferences panel
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-foreground">
                Cookie Preferences
              </h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Necessary Cookies</h3>
                  </div>
                  <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                    Always Active
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                  Essential for the website to function properly. Cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <BarChart className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Analytics Cookies</h3>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-label="Toggle analytics cookies"
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                  Help us understand how visitors interact with our website by collecting anonymous information.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Cookie className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Marketing Cookies</h3>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.marketing ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-label="Toggle marketing cookies"
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                  Used to track visitors across websites to display relevant advertisements and promotions.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-6 py-3 border-2 border-border rounded-full font-medium hover:bg-secondary transition-colors text-foreground"
              >
                Reject All
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-accent transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}