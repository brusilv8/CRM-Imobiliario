import { useEffect } from 'react';

export default function GoogleCalendarCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      if (window.opener) {
        window.opener.postMessage({ type: 'google-calendar-error', error }, '*');
      }
      window.close();
      return;
    }

    if (code) {
      if (window.opener) {
        window.opener.postMessage({ type: 'google-calendar-code', code }, '*');
        window.close();
      } else {
        console.error('No opener window found');
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
}
