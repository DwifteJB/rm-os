import { useState, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

export default function CD({
  style,
  diskURL,
  wavesurfer,
}: {
  style: React.CSSProperties;
  diskURL?: string;
  wavesurfer: WaveSurfer | null;
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (wavesurfer) {
      const interval = setInterval(() => {
        if (wavesurfer) {
          setCurrentTime(wavesurfer.getCurrentTime());
          setDuration(wavesurfer.getDuration());
        }
      }, 1);

      return () => clearInterval(interval);
    }
  }, [wavesurfer]);

  return (
    <img
      style={{
        ...style,
        rotate: `${wavesurfer ? (currentTime / duration) * 760 : 0}deg`,
      }}
      className="select-none w-40 h-40 rounded-full object-scale-down aspect-square"
      src={diskURL ? diskURL : "/yeezus.png"}
    />
  );
}
