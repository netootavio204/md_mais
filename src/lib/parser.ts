export interface ChatMessage {
  id: string;
  date: string;
  time: string;
  sender: string;
  message: string;
  isMe: boolean;
}

/**
 * Função responsável por ler o texto bruto de um export do WhatsApp (.md ou .txt)
 * e convertê-lo em uma lista de objetos estruturados do tipo `ChatMessage`.
 */
export function parseWhatsAppChat(rawText: string): ChatMessage[] {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  // Regex para formato padrão de cabeçalho Markdown de data: ## 23 de junho de 2026
  const dateRegex = /^##\s+(.*)$/;

  // Regex para capturar as mensagens: [9:05] **+55 19 99851-5599:** Mensagem ou [16:14] **Você:** Mensagem
  const msgRegex = /^\[(\d{1,2}:\d{2})\] \*\*(.*?):\*\* (.*)$/;

  // Fallback para iOS: [14/09/2026, 23:20:15] Remetente: Mensagem
  const iosRegex = /^\[(\d{1,4}[\/\.-]\d{1,2}[\/\.-]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?)\]\s+([^:\n\r]+):\s*(.*)$/;

  // Fallback para Android: 14/09/2026 23:20 - Remetente: Mensagem
  const androidRegex = /^(\d{1,4}[\/\.-]\d{1,2}[\/\.-]\d{2,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?)\s*-\s*([^:\n\r]+):\s*(.*)$/;

  const lines = rawText.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  let currentDate = "";

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    // Ignore linhas vazias ou divisores markdown "---"
    if (!trimmedLine || trimmedLine === "---") {
      continue;
    }

    // 1. Atualizar currentDate quando encontrar cabeçalho "## ..."
    const dateMatch = trimmedLine.match(dateRegex);
    if (dateMatch) {
      currentDate = dateMatch[1].trim();
      continue;
    }

    // 2. Tentar match com o novo formato Markdown principal
    const msgMatch = trimmedLine.match(msgRegex);
    if (msgMatch) {
      const [, time, senderRaw, messageText] = msgMatch;
      const sender = senderRaw.trim();
      const isMe = sender === "Você";

      const newMessage: ChatMessage = {
        id: `msg-${messages.length + 1}-${Math.random().toString(36).substring(2, 9)}`,
        date: currentDate,
        time: time.trim(),
        sender,
        message: messageText,
        isMe,
      };

      messages.push(newMessage);
      continue;
    }

    // 3. Suporte de fallback para formatos legados do WhatsApp (iOS / Android)
    let legacyMatch = trimmedLine.match(iosRegex) || trimmedLine.match(androidRegex);
    if (legacyMatch) {
      const date = legacyMatch[1];
      const time = legacyMatch[2];
      const sender = legacyMatch[3].trim();
      const messageText = legacyMatch[4];
      const isMe = sender === "Você";

      const newMessage: ChatMessage = {
        id: `msg-${messages.length + 1}-${Math.random().toString(36).substring(2, 9)}`,
        date: date.trim(),
        time: time.trim(),
        sender,
        message: messageText,
        isMe,
      };

      messages.push(newMessage);
      continue;
    }

    // 4. Se não deu match e já temos mensagens, trata como mensagem multilinha
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      lastMessage.message += "\n" + rawLine;
    }
  }

  // Debug no console conforme solicitado
  console.log("ChatMessage array gerado (total:", messages.length, "):", messages);

  return messages;
}
