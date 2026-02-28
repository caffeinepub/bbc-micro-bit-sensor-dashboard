import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

function isChromiumBased(): boolean {
  const ua = navigator.userAgent;
  return /Chrome|Chromium|Edg/.test(ua) && !/Firefox|Safari\//.test(ua);
}

export function BrowserCompatibilityNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || isChromiumBased()) return null;

  return (
    <div className="compat-banner rounded-xl px-4 py-3 flex items-start gap-3 mb-4">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-amber-300 font-semibold text-sm">Browser Compatibility Notice</p>
        <p className="text-amber-200/80 text-xs mt-0.5">
          Web Bluetooth and Web Serial APIs require <strong>Google Chrome</strong> or{' '}
          <strong>Microsoft Edge</strong> on HTTPS. Firefox and Safari are not supported.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/60 hover:text-amber-300 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
