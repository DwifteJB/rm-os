import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../components/mainAppContext";
import { ImagePlus, Trash2 } from "lucide-react";

const SettingsElement = () => {
  const { settings, setSettings } = useContext(AppContext);
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings((prev) => ({
          ...prev,
          backgroundImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setLocalSettings((prev) => ({
      ...prev,
      backgroundImage: undefined,
    }));
  };

  const handleSave = () => {
    setSettings(localSettings);
    localStorage.setItem("settings", JSON.stringify(localSettings));
  };

  return (
    <div className="p-4 text-white">
      <div className="text-center">
        <h2 className="text-xl inter font-bold mb-4">Settings :D</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2 inter">Username</label>
          <input
            type="text"
            value={localSettings.username || ""}
            onChange={(e) =>
              setLocalSettings((prev) => ({
                ...prev,
                username: e.target.value,
              }))
            }
            className="bg-[#C22DC2]/50 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-2 inter">Background Image</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="bg-[#C22DC2]/50 p-2 rounded w-full flex items-center gap-2">
                <ImagePlus size={20} />
                <span>
                  {localSettings.backgroundImage
                    ? "Change Image"
                    : "Choose Image"}
                </span>
              </div>
            </div>
            {localSettings.backgroundImage && (
              <button
                onClick={handleRemoveImage}
                className="bg-red-500/50 hover:bg-red-500/70 transition-colors p-2 rounded"
                title="Remove background image"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
          {localSettings.backgroundImage && (
            <div className="mt-2 rounded-lg overflow-hidden bg-[#C22DC2]/20 p-2">
              <div className="relative w-full h-64">
                <img
                  src={localSettings.backgroundImage}
                  alt="Background Preview"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full min-w-[50%] min-h-[50%] rounded object-contain"
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-center items-center">
          <button
            onClick={handleSave}
            className="bg-[#C22DC2] px-4 py-2 rounded hover:bg-[#C22DC2]/80 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export const Settings = () => {
  const window = {
    element: <SettingsElement />,
    name: "settings",
    icon: "settings.png",
    minimumSize: { width: 300, height: 650 },
    initialSize: { width: 500, height: 650 },
    customBackgroundClasses: "",
  };

  return window;
};

export default Settings;
