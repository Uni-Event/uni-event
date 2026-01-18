import React, { useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrScanner({ active, onDecode, onStatus, disabled }) {
  const reactId = useId();
  const mountId = `qr-${reactId.replace(/:/g, "")}`;

  const qrRef = useRef(null);

  const onDecodeRef = useRef(onDecode);
  const onStatusRef = useRef(onStatus);
  const disabledRef = useRef(Boolean(disabled));

  const lastTextRef = useRef("");
  const lastAtRef = useRef(0);

  // ținem ultimele callback-uri fără să repornim camera
  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);
  useEffect(() => {
    disabledRef.current = Boolean(disabled);
  }, [disabled]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!active) return;

      onStatusRef.current?.("Pornesc camera...");
      const qr = new Html5Qrcode(mountId);
      qrRef.current = qr;

      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          (decodedText) => {
            if (disabledRef.current) return; // nu opri camera, doar ignoră scanările cât e busy

            const now = Date.now();
            if (
              decodedText === lastTextRef.current &&
              now - lastAtRef.current < 1200
            )
              return;

            lastTextRef.current = decodedText;
            lastAtRef.current = now;

            onDecodeRef.current?.(decodedText);
          },
          () => {},
        );

        if (!cancelled)
          onStatusRef.current?.("Camera pornită. Scanează QR-ul...");
      } catch (e) {
        console.error(e);
        onStatusRef.current?.("Nu pot porni camera. Verifică permisiunile.");
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
  }, [active, mountId]);

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div id={mountId} style={{ width: "100%" }} />
    </div>
  );
}