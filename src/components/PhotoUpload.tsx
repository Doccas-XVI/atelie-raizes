import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder?: string;
};

const BUCKET = "atelie-fotos";

export function PhotoUpload({ value, onChange, folder = "uploads" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErro(null);
    if (!file.type.startsWith("image/")) {
      setErro("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErro("Imagem muito grande (máx 5 MB).");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-md border border-border bg-surface px-3 py-2 text-sm hover:bg-accent">
          {uploading ? "Enviando…" : value ? "Trocar imagem" : "Escolher imagem"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Remover
          </button>
        )}
      </div>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
      {value && (
        <img
          src={value}
          alt="Pré-visualização"
          className="h-28 w-28 rounded-md border border-border object-cover"
        />
      )}
    </div>
  );
}
