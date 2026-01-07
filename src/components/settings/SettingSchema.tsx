import { Dispatch, SetStateAction, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StringMap } from "@/types/typeUtils";
import { Button } from "@/components/ui/button";

export class RegexSetting {
  placeholder: string;
  pattern: RegExp;

  constructor(placeholder: string, pattern: RegExp) {
    this.placeholder = placeholder;
    this.pattern = pattern;
  }
}

export type SettingsSchema = StringMap<
  "boolean" | "string" | "number" | string[] | RegexSetting
>;

export default function SettingSchema<T>({
  settings,
  setSettings,
  schema,
  onSave,
}: {
  settings: T;
  setSettings: Dispatch<SetStateAction<T>>;
  schema: SettingsSchema;
  onSave: () => void;
}) {
  const [feedback, setFeedback] = useState<
    undefined | { kind: "error" | "info"; message: string }
  >();

  // Ref to store debounce timer
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegexChange = (
    key: string,
    regexSetting: RegexSetting,
    value: string
  ) => {
    handleChange(key, value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!regexSetting.pattern.test(value)) {
        setFeedback({
          kind: "error",
          message: `Value does not match the pattern`,
        });
      } else {
        setFeedback(undefined);
      }
    }, 1500);
  };

  const renderInput = (key: string, type: any) => {
    if (Array.isArray(type)) {
      return (
        <Select
          value={(settings as any)[key] || []}
          onValueChange={(val) => handleChange(key, val)}
        >
          <SelectTrigger>
            <SelectValue placeholder={key} />
          </SelectTrigger>
          <SelectContent>
            {type.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    } else if (type === "boolean") {
      return (
        <Checkbox
          checked={(settings as any)[key] || false}
          onCheckedChange={(val) => handleChange(key, val)}
        />
      );
    } else if (type === "string") {
      return (
        <Input
          type="text"
          value={(settings as any)[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
        />
      );
    } else if (type === "number") {
      return (
        <Input
          type="number"
          value={(settings as any)[key] || 0}
          onChange={(e) => handleChange(key, Number(e.target.value))}
        />
      );
    } else if (type instanceof RegexSetting) {
      return (
        <Input
          type="text"
          value={(settings as any)[key] || ""}
          placeholder={type.placeholder}
          onChange={(e) => handleRegexChange(key, type, e.target.value)}
        />
      );
    }
  };

  return (
    <>
      {Object.entries(schema).map(([key, type]) => (
        <div key={key} className="flex items-center justify-between space-x-4">
          <label className="capitalize">{key.replaceAll("_", "_")}</label>
          {renderInput(key, type)}
        </div>
      ))}

      {feedback && (
        <div
          className={`text-sm rounded-md p-2 ${
            feedback.kind === "error"
              ? "bg-red-500/20 text-red-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <Button
        onClick={() => {
          if (feedback === undefined) onSave();
        }}
        variant="outline"
      >
        Save
      </Button>
    </>
  );
}
