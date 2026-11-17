import { useState } from "react";
import { ImageOff } from "lucide-react";

/** The parent reserves the frame; the image never contributes intrinsic height. */
export function CollectionImage({ src, alt }: { src: string; alt: string }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center bg-muted transition-opacity duration-500 motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`}
      >
        {failed ? (
          <ImageOff className="h-8 w-8 text-primary/40" strokeWidth={1} />
        ) : (
          <div className="absolute inset-0 animate-soft-pulse bg-primary/5 motion-reduce:animate-none" />
        )}
      </div>
      <img
        ref={(image) => {
          if (image?.complete && image.naturalWidth > 0) setReady(true);
        }}
        src={src}
        alt={alt}
        width={800}
        height={1000}
        loading="lazy"
        decoding="async"
        onLoad={() => setReady(true)}
        onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full object-cover motion-reduce:transition-none ${ready && !failed ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
