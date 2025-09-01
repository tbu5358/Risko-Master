import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

export default function Play() {
  const [params] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Optionally, could postMessage the mode to the game if needed
  }, [params]);

  const mode = params.get('mode') || '1';
  const src = `/game/index.html?mode=${encodeURIComponent(mode)}`;

  return (
    <div className="w-screen h-screen">
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; clipboard-read; clipboard-write"
      />
    </div>
  );
}

