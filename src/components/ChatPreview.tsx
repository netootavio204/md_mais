"use client";

import React, { forwardRef } from "react";
import { Download, Loader2 } from "lucide-react";
import { ChatMessage } from "@/lib/parser";
import { Button } from "@/components/ui/button";

interface ChatPreviewProps {
  messages: ChatMessage[];
  onExportPDF?: () => void;
  isExporting?: boolean;
}

export const ChatPreview = forwardRef<HTMLDivElement, ChatPreviewProps>(
  ({ messages, onExportPDF, isExporting }, ref) => {
    if (!messages || messages.length === 0) {
      return null;
    }

    // Mapeamento dinâmico de cores para remetentes (para destacar nomes de remetentes diferentes no chat)
    const senderColorMap: Record<string, string> = {};
    const colors = [
      "text-emerald-700 dark:text-emerald-400",
      "text-teal-700 dark:text-teal-400",
      "text-blue-700 dark:text-blue-400",
      "text-purple-700 dark:text-purple-400",
      "text-indigo-700 dark:text-indigo-400",
      "text-rose-700 dark:text-rose-400",
      "text-amber-700 dark:text-amber-400",
    ];

    let colorIndex = 0;
    messages.forEach((msg) => {
      if (!senderColorMap[msg.sender]) {
        senderColorMap[msg.sender] = colors[colorIndex % colors.length];
        colorIndex++;
      }
    });

    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {/* Botão de Exportar PDF proeminente no topo da área de preview usando Shadcn UI Button */}
        {onExportPDF && (
          <div className="flex justify-end items-center">
            <Button
              onClick={onExportPDF}
              disabled={isExporting}
              size="lg"
              className="w-full sm:w-auto font-bold shadow-xl shadow-emerald-500/20 text-slate-950 bg-emerald-500 hover:bg-emerald-400"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  <span>Exportar PDF</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* Container que será capturado e renderizado no PDF */}
        <div
          ref={ref}
          id="chat-preview-container"
          className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-[#efeae2] dark:bg-[#0b141a] transition-all"
        >
          {/* Header do Chat (Estilo WhatsApp) */}
          <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-3 flex items-center gap-3 border-b border-black/10">
            <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm">
              💬
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">
                Conversa do WhatsApp
              </h3>
              <p className="text-xs text-emerald-200 dark:text-slate-400">
                {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"}
              </p>
            </div>
          </div>

          {/* Área das Mensagens */}
          <div className="p-4 sm:p-6 space-y-3 min-h-[300px] max-h-[600px] overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a] pdf-messages-area">
            {messages.map((msg, index) => {
              const isMe = msg.isMe;
              const senderColor = senderColorMap[msg.sender] || "text-emerald-700";

              // Verificar se a data mudou em relação à mensagem anterior (suporta date ou currentDate)
              const msgDate = (msg as any).currentDate || msg.date;
              const previousMsg = index > 0 ? messages[index - 1] : null;
              const previousDate = previousMsg ? ((previousMsg as any).currentDate || previousMsg.date) : null;
              const showDateHeader = !previousMsg || previousDate !== msgDate;

              return (
                <React.Fragment key={msg.id || index}>
                  {/* Divisor centralizado de Data (estilo WhatsApp) */}
                  {showDateHeader && msgDate && (
                    <div className="flex justify-center my-3 pdf-date-divider" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                      <span className="bg-white/80 dark:bg-[#182229]/90 text-slate-600 dark:text-slate-300 text-[11px] font-medium px-3 py-1 rounded-md shadow-sm border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-wider">
                        {msgDate}
                      </span>
                    </div>
                  )}

                  {/* Item da Mensagem */}
                  <div
                    className={`flex flex-col pdf-message-item ${isMe ? "items-end" : "items-start"}`}
                    style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                  >
                    <div
                      className={`relative max-w-[85%] sm:max-w-[75%] px-3.5 py-2 text-sm shadow-sm transition-all ${
                        isMe
                          ? "bg-green-100 text-slate-900 rounded-2xl rounded-tr-none"
                          : "bg-white text-slate-900 rounded-2xl rounded-tl-none"
                      }`}
                    >
                      {/* Nome do Remetente */}
                      <div className={`text-[11px] font-bold mb-1 leading-none ${senderColor}`}>
                        {msg.sender}
                      </div>

                      {/* Conteúdo da Mensagem */}
                      <div className="whitespace-pre-wrap break-words leading-relaxed pr-12 text-[13.5px]">
                        {msg.message}
                      </div>

                      {/* Horário da Mensagem */}
                      <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 font-medium select-none ml-2">
                        {msg.time}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ChatPreview.displayName = "ChatPreview";

