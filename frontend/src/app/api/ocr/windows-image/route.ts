import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OcrResponse = {
  mode: string;
  text: string;
  preview: string;
  error?: string;
};

function runPowerShellOcr(scriptPath: string, imagePath: string) {
  return new Promise<OcrResponse>((resolve) => {
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        scriptPath,
        "-ImagePath",
        imagePath,
      ],
      {
        windowsHide: true,
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({
        mode: "windows_ocr_failed",
        text: "",
        preview: "",
        error: error.message,
      });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        resolve({
          mode: "windows_ocr_failed",
          text: "",
          preview: "",
          error: stderr.trim() || `OCR local falhou com codigo ${code}.`,
        });
        return;
      }

      try {
        const parsed = JSON.parse(stdout) as { text?: string; preview?: string };
        resolve({
          mode: "windows_ocr_frontend",
          text: parsed.text?.trim() ?? "",
          preview: parsed.preview?.trim() ?? "",
        });
      } catch (error) {
        resolve({
          mode: "windows_ocr_failed",
          text: "",
          preview: "",
          error: error instanceof Error ? error.message : "Falha ao interpretar a resposta do OCR local.",
        });
      }
    });
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { mode: "invalid_input", text: "", preview: "", error: "Arquivo nao informado." },
      { status: 400 }
    );
  }

  const extension = path.extname(file.name || "").toLowerCase();
  const allowed = new Set([".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff", ".webp"]);
  if (!allowed.has(extension)) {
    return NextResponse.json(
      { mode: "unsupported_file", text: "", preview: "", error: "A rota local de OCR aceita apenas imagens." },
      { status: 400 }
    );
  }

  const frontendRoot = process.cwd();
  const backendScript = path.resolve(frontendRoot, "..", "backend", "src", "CrmObras.Api", "Scripts", "Invoke-WindowsImageOcr.ps1");

  try {
    await fs.access(backendScript);
  } catch {
    return NextResponse.json(
      { mode: "script_missing", text: "", preview: "", error: "Script local de OCR nao encontrado." },
      { status: 500 }
    );
  }

  const tempDir = path.resolve(frontendRoot, ".tmp", "ocr");
  await fs.mkdir(tempDir, { recursive: true });

  const tempFilePath = path.join(tempDir, `${randomUUID()}-${file.name}`);

  try {
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

    const result = await runPowerShellOcr(backendScript, tempFilePath);

    return NextResponse.json(result);
  } finally {
    await fs.rm(tempFilePath, { force: true }).catch(() => undefined);
  }
}
