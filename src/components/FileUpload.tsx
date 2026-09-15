"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, ShieldCheck, MessageSquareText, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseWhatsAppChat, ChatMessage } from "@/lib/parser";

interface FileUploadProps {
  onFileParsed?: (rawContent: string, fileName: string, messages: ChatMessage[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileParsed }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [parsedMessages, setParsedMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validação de extensão de arquivo (.md ou .txt)
    const isMarkdown = file.name.endsWith(".md") || file.name.endsWith(".txt") || file.type === "text/markdown";
    if (!isMarkdown) {
      setError("Por favor, selecione um arquivo válido no formato Markdown (.md) ou Texto (.txt).");
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const rawText = event.target?.result as string;

      if (rawText !== undefined) {
        // Parsear o chat do WhatsApp
        const messages = parseWhatsAppChat(rawText);

        // Logs do console conforme especificações da Fase 1 e 2
        console.log("================================================");
        console.log(`📄 ChatWeaver - Arquivo Lido: ${file.name}`);
        console.log(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`Mensagens Encontradas: ${messages.length}`);
        console.log("================================================");
        console.log("Amostra das Mensagens Parseadas:", messages.slice(0, 5));
        console.log("================================================");

        setFileContent(rawText);
        setParsedMessages(messages);
        const lines = rawText.split("\n").length;
        setLineCount(lines);

        if (onFileParsed) {
          onFileParsed(rawText, file.name, messages);
        }
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError("Ocorreu um erro ao tentar ler o arquivo. Tente novamente.");
      setIsLoading(false);
    };

    // Leitura 100% client-side como texto simples
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileContent(null);
    setParsedMessages([]);
    setError(null);
    setLineCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Contagem de participantes únicos
  const sendersList = Array.from(new Set(parsedMessages.map((m) => m.sender)));

  return (
    <Card className="w-full max-w-xl mx-auto border-slate-800 bg-slate-950/70 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Glow decorativo sutil */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <UploadCloud className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Carregar Backup do WhatsApp
        </CardTitle>
        <CardDescription className="text-slate-400 text-sm">
          Selecione ou arraste o arquivo <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">.md</code> contendo a conversa exportada.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input escondido */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt"
          onChange={handleFileInputChange}
          className="hidden"
          id="whatsapp-file-input"
        />

        {!selectedFile ? (
          /* Dropzone Principal */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group
              ${
                isDragging
                  ? "border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-lg shadow-emerald-500/10"
                  : "border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80"
              }
            `}
          >
            <div className={`p-4 rounded-full bg-slate-800/80 text-slate-300 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 ${isDragging ? "bg-emerald-500 text-slate-950 scale-110" : ""}`}>
              <UploadCloud className="w-8 h-8" />
            </div>

            <p className="text-slate-200 font-medium text-center text-sm sm:text-base">
              Arraste e solte seu arquivo <span className="text-emerald-400 font-semibold">.md</span> aqui
            </p>
            <p className="text-slate-500 text-xs mt-1 text-center">
              ou clique para navegar nos seus arquivos
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Processamento 100% Client-side. Seus dados continuam no seu dispositivo.</span>
            </div>
          </div>
        ) : (
          /* Estado com arquivo selecionado */
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{selectedFile.name}</h4>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB • {lineCount} linhas no arquivo
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Parseando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Parseado</span>
                </div>
              )}
            </div>

            {/* Badges de estatística do Parse */}
            {parsedMessages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <MessageSquareText className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Mensagens</p>
                    <p className="text-sm font-bold text-white">{parsedMessages.length}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Participantes</p>
                    <p className="text-sm font-bold text-white truncate max-w-[120px]">
                      {sendersList.join(", ") || "Nenhum"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sucesso / Log info */}
            {fileContent && (
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Prévia das Mensagens Parseadas
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">F12 para Log Completo</span>
                </div>
                {parsedMessages.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {parsedMessages.slice(0, 4).map((msg) => (
                      <div key={msg.id} className="text-[11px] leading-tight text-slate-300 flex items-baseline gap-1.5">
                        <span className="text-slate-500 font-mono text-[10px] shrink-0">[{msg.time}]</span>
                        <span className={`font-semibold shrink-0 ${msg.isMe ? "text-emerald-400" : "text-blue-400"}`}>
                          {msg.sender}:
                        </span>
                        <span className="truncate">{msg.message}</span>
                      </div>
                    ))}
                    {parsedMessages.length > 4 && (
                      <p className="text-[10px] text-slate-500 italic pt-1">
                        + mais {parsedMessages.length - 4} mensagens...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">Nenhuma mensagem formatada detectada no padrão do WhatsApp.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2">
        {selectedFile ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Selecionar Outro Arquivo
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Escolher Arquivo .md
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
