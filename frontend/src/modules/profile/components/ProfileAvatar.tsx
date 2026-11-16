import { AvatarInput } from "../../app/ui/AvatarInput";

interface ProfileAvatarProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ProfileAvatar = ({
  value,
  onChange,
  disabled = false,
}: ProfileAvatarProps) => (
  <div className="space-y-2">
    <p className="text-sm font-medium text-stone-700">Профайл зураг</p>
    <AvatarInput value={value} onChange={onChange} disabled={disabled} />
  </div>
);
