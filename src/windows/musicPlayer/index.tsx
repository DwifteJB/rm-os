import { useEffect, useState } from "react";

import WavesurferPlayer from "@wavesurfer/react";
import CD from "../../components/CD";
import WaveSurfer from "wavesurfer.js";
import { useAnimate } from "react-simple-animate";

import songs from "../../lib/songs";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

const MusicPlayerPage = () => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>(null!);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [song, setSong] = useState(songs[0]);

  const { style, play } = useAnimate({
    duration: 1.5,
    start: {
      position: "absolute",
      left: "0px",
      height: "100%",
      width: "100%",
    },
    end: {
      position: "absolute",
      left: "3rem",
      height: "100%",
      width: "100%",
    },
    complete: {
      position: "absolute",
      left: "3rem",
      height: "100%",
      width: "100%",
    },
  });

  useEffect(() => {
    play(isPlaying);
  }, [isPlaying]);

  const onReady = (ws: WaveSurfer) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const nextSong = () => {
    const index = songs.indexOf(song);
    if (index < songs.length - 1) {
      setSong(songs[index + 1]);
    } else {
      setSong(songs[0]);
    }
  };

  const prevSong = () => {
    const index = songs.indexOf(song);
    if (index > 0) {
      setSong(songs[index - 1]);
    } else {
      setSong(songs[songs.length - 1]);
    }
  };

  const onPlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="text-white h-full w-full flex flex-col overflow-hidden">
      <div className="text-center p-4">
        <span className="text-xl text-white inter">{song.title}</span>
      </div>

      <div className="items-center justify-center align-middle">
        <div className="h-40 w-full flex items-center justify-center">
          <div className="w-40 h-40 aspect-square relative">
            <CD style={style} wavesurfer={wavesurfer} />
            <img
              src={song.icon}
              alt="meow"
              className="w-40 h-40 absolute top-0 left-0 z-10 aspect-square"
            />
          </div>
        </div>
      </div>

      <div className="text-center p-4">
        <div className="flex items-center pt-4 gap-2">
          <span className="text-sm min-w-[40px] text-right">
            {formatTime(currentTime)}
          </span>
          <div className="w-full">
            <WavesurferPlayer
              height={20}
              waveColor="violet"
              url={song.src}
              onReady={onReady}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeupdate={(wavesurfer, time) => {
                setCurrentTime(time);
                setDuration(wavesurfer.getDuration());
              }}
            />
          </div>
          <span className="text-sm min-w-[40px] text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="text-center flex flex-row justify-center items-center gap-4">
        <button
          onClick={prevSong}
          className="inter rounded-xl p-1 bg-[#C22DC2]/50 border border-[#C22DC2]"
        >
          <ArrowLeft size={25} />
        </button>
        <button
          onClick={onPlayPause}
          className="inter rounded-xl p-1 bg-[#C22DC2]/50 border border-[#C22DC2]"
        >
          {isPlaying ? <Pause size={25} /> : <Play size={25} />}
        </button>
        <button
          onClick={nextSong}
          className="inter rounded-xl p-1 bg-[#C22DC2]/50 border border-[#C22DC2]"
        >
          <ArrowRight size={25} />
        </button>
      </div>
    </div>
  );
};

export const MusicPlayer = () => {
  const window = {
    element: <MusicPlayerPage />,
    name: "music player :3",
    icon: "boom.png",
    minimumSize: { width: 400, height: 400 },
    initialSize: { width: 500, height: 400 },
    customBackgroundClasses: "",
  };

  return window;
};

export default MusicPlayer;
