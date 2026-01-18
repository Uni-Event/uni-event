import React, { useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ active, onDecode, onStatus }) {
  const reactId = useId();
  const mountId = `qr-${reactId.replace(/:/g, "")}`; 

  const qrRef = useRef(null);
  const lastTextRef = useRef("");
  const lastAtRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!active) return;

      onStatus?.("Pornesc camera...");
      const qr = new Html5Qrcode(mountId);
      qrRef.current = qr;

      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            const now = Date.now();

            if (
              decodedText === lastTextRef.current &&
              now - lastAtRef.current < 1200
            ) {
              return;
            }

            lastTextRef.current = decodedText;
            lastAtRef.current = now;

            onDecode?.(decodedText);
          },
          () => {},
        );

        if (!cancelled) onStatus?.("Camera pornită. Scanează QR-ul...");
      } catch (e) {
        console.error(e);
        onStatus?.("Nu pot porni camera. Verifică permisiunile.");
      }
    };

    const stop = async () => {
      const qr = qrRef.current;
      qrRef.current = null;
      if (!qr) return;

      try {
        await qr.stop();
      } catch (e) {
        if (import.meta?.env?.DEV) console.debug("qr.stop failed", e);
      }

      try {
        await qr.clear();
      } catch (e) {
        if (import.meta?.env?.DEV) console.debug("qr.clear failed", e);
      }
    };

    start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [active, mountId, onDecode, onStatus]);

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div id={mountId} style={{ width: "100%" }} />
    </div>
  );
}
