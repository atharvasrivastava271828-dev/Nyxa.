import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8 shadow-[0_0_30px_var(--halo-1)]">
        <span className="text-6xl text-black">☯</span>
      </div>
      
      <h1 className="text-5xl font-bold tracking-tight mb-4">Get Nyxa on Mobile</h1>
      <p className="text-xl text-[var(--muted)] max-w-xl mb-12">
        Experience the first Trillion-Dollar AI Exchange Layer natively on your Android device. 
        Download the official APK below to install the app.
      </p>

      <div className="nyxa-card p-8 rounded-2xl max-w-md w-full border-[var(--halo-3)]">
        <h2 className="text-2xl font-bold mb-2">Android APK</h2>
        <p className="text-sm text-[var(--muted)] mb-8">Requires Android 8.0 or later.</p>
        
        <a 
          href="/Nyxa.apk" 
          download="Nyxa.apk"
          className="nyxa-btn nyxa-btn-primary w-full py-4 text-lg font-bold shadow-[0_0_15px_var(--halo-1)] hover:shadow-[0_0_25px_var(--halo-2)] transition-shadow"
        >
          ⬇ Download for Android
        </a>
      </div>

      <div className="mt-12 text-sm text-[var(--muted)] max-w-lg">
        <p className="mb-2"><strong>How to install:</strong></p>
        <p>1. Download the APK file to your device.</p>
        <p>2. Open the file. Your phone may ask you to allow installations from "Unknown Sources" in your Settings.</p>
        <p>3. Tap Install and open the app!</p>
      </div>
    </div>
  );
}
