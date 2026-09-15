"use client";

import { useState, useRef } from "react";
import { MessageSquare, Shield, FileCode2, Sparkles, CheckCircle, UserCheck, Download, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ChatPreview } from "@/components/ChatPreview";
import { ChatMessage } from "@/lib/parser";

export default function Home() {
  const [parsedFileName, setParsedFileName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileParsed = (_content: string, fileName: string, parsedMsgs: ChatMessage[]) => {
    setParsedFileName(fileName);
    setMessages(parsedMsgs);
  };

  const handleExportPDF = async () => {
    if (messages.length === 0) return;

    try {
      setIsExporting(true);

      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // 1. Cabeçalho do Documento
      doc.setFillColor(7, 94, 84); // WhatsApp Header Green
      doc.rect(0, 0, pageWidth, 25, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Conversa do WhatsApp", margin, 12);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${messages.length} mensagens exportadas`, margin, 18);

      y = 35;

      let lastDate = "";

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const msgDate = (msg as any).currentDate || msg.date;

        // Verificar limite da página
        if (y > pageHeight - 25) {
          doc.addPage();
          y = margin;
        }

        // Divisor de Data se mudar
        if (msgDate && msgDate !== lastDate) {
          lastDate = msgDate;
          y += 3;
          doc.setFillColor(230, 235, 240);
          const dateText = msgDate.toUpperCase();
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          const dateWidth = doc.getTextWidth(dateText) + 8;
          const dateX = (pageWidth - dateWidth) / 2;
          
          doc.roundedRect(dateX, y - 4, dateWidth, 6, 2, 2, "F");
          doc.setTextColor(80, 90, 100);
          doc.text(dateText, dateX + 4, y);
          y += 8;
        }

        // Preparar dimensões do balão de mensagem
        const isMe = msg.isMe;
        const bubbleMaxWidth = contentWidth * 0.75;
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const senderText = msg.sender;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const messageLines = doc.splitTextToSize(msg.message, bubbleMaxWidth - 10);
        
        const lineHeight = 5;
        const textHeight = messageLines.length * lineHeight;
        const bubbleHeight = textHeight + 12;

        // Se o balão não couber na página atual, quebrar página
        if (y + bubbleHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        const bubbleX = isMe ? pageWidth - margin - bubbleMaxWidth : margin;

        // Desenhar balão (Verde claro se for 'Você', Branco se for outro remetente)
        if (isMe) {
          doc.setFillColor(217, 253, 211); // bg-green-100 whatsapp
          doc.setDrawColor(180, 230, 175);
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(220, 225, 230);
        }

        doc.roundedRect(bubbleX, y, bubbleMaxWidth, bubbleHeight, 3, 3, "FD");

        // Nome do Remetente
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        if (isMe) {
          doc.setTextColor(16, 120, 60);
        } else {
          doc.setTextColor(0, 100, 180);
        }
        doc.text(senderText, bubbleX + 5, y + 5);

        // Texto da Mensagem
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);
        doc.text(messageLines, bubbleX + 5, y + 10);

        // Horário da Mensagem
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 140, 150);
        const timeText = msg.time || "";
        const timeWidth = doc.getTextWidth(timeText);
        doc.text(timeText, bubbleX + bubbleMaxWidth - timeWidth - 4, y + bubbleHeight - 3);

        y += bubbleHeight + 4;
      }

      doc.save("Conversa_WhatsApp.pdf");
    } catch (error) {
      console.error("Erro na geração nativa do PDF:", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const senders = Array.from(new Set(messages.map((m) => m.sender)));
  const userA = senders[0] || "Remetente 1";
  const userB = senders[1] || "Remetente 2";

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-8 md:p-12 relative overflow-hidden">
      {/* Elementos visuais de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Centralizado */}
      <header className="max-w-4xl mx-auto text-center pt-6 pb-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fase 4 • Exportação em PDF</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
          Chat<span className="text-emerald-400">Weaver</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Transforme seus backups do WhatsApp em formato <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">.md</code> em documentos organizados e exporte em PDF formatado.
        </p>

        {/* Badges de Destaque */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 pt-2">
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sem Envio de Dados</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>Regex Multi-Formato</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Exportação PDF Nativa</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal / Upload Area */}
      <section className="w-full max-w-4xl mx-auto my-auto py-6">
        <FileUpload onFileParsed={handleFileParsed} />

        {/* Resumo do Parse */}
        {parsedFileName && (
          <div className="mt-6 max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Estado React Atualizado ({messages.length} mensagens)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{parsedFileName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Esquerda (isMe: false)</span>
                </div>
                <p className="font-semibold text-white">{userA}</p>
                <p className="text-[10px] text-slate-500">
                  {messages.filter((m) => !m.isMe).length} mensagens
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Direita (isMe: true)</span>
                </div>
                <p className="font-semibold text-white">{senders.length > 1 ? userB : "N/A"}</p>
                <p className="text-[10px] text-slate-500">
                  {messages.filter((m) => m.isMe).length} mensagens
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Renderização Condicional do ChatPreview e Botão de Exportação ao ter messages.length > 0 */}
        {messages.length > 0 && (
          <div className="mt-8">
            <ChatPreview
              ref={previewRef}
              messages={messages}
              onExportPDF={handleExportPDF}
              isExporting={isExporting}
            />
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto text-center text-xs text-slate-500 pt-6 pb-4 border-t border-slate-800/50 w-full mt-8">
        <p>ChatWeaver — Leitura e visualização privada de backups do WhatsApp.</p>
      </footer>
    </main>
  );
}
