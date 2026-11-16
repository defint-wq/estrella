import { useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

interface AvatarInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AvatarInput = ({
  value,
  onChange,
  disabled = false,
}: AvatarInputProps) => {
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("PNG, JPEG, WebP эсвэл GIF зураг сонгоно уу.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Зургийн хэмжээ 2 MB-аас ихгүй байна.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Зургийг уншиж чадсангүй.");
        return;
      }
      setError("");
      onChange(reader.result);
    };
    reader.onerror = () => setError("Зургийг уншиж чадсангүй.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e8e3db] bg-white text-[#9b8a73]">
          {value ? (
            <img
              src={value}
              alt=""
              referrerPolicy="no-referrer"
              className="size-full object-cover"
            />
          ) : (
            <ImageUp size={19} />
          )}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e1dbd0] bg-white px-3.5 py-2.5 text-xs font-medium text-[#70695e] transition hover:bg-[#f8f6f2] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          <ImageUp size={14} />
          Файл сонгох
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={disabled}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
        {value && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setError("");
              onChange("");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium text-[#a75e52] transition hover:bg-[#f9eeeb] disabled:opacity-50"
          >
            <Trash2 size={14} />
            Арилгах
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
};
