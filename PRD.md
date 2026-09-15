1. Visão Geral
O ChatWeaver (nome sugerido) é uma aplicação web focada na conversão de backups de conversas do WhatsApp no formato Markdown (.md) ou Texto (.txt) para um documento PDF estilizado. O diferencial do sistema é reconstruir visualmente a interface de um aplicativo de mensagens (com balões de fala, cores distintas para remetentes e alinhamento esquerdo/direito) antes de exportar.

2. Objetivos
Organização: Ler um arquivo .md desorganizado e separar metadados (data, hora, remetente) do conteúdo da mensagem.

Visualização: Renderizar a conversa no navegador simulando a tela do WhatsApp.

Exportação: Gerar um arquivo PDF de alta qualidade preservando o layout e as cores da interface web.

Privacidade: Processar tudo localmente no navegador do usuário (Client-side) para garantir que os dados sensíveis das conversas não passem por nenhum servidor.

3. Stack Tecnológico Recomendado
Framework: Next.js (com React).

Estilização: Tailwind CSS (perfeito para desenhar os balões do chat) e Shadcn UI (para botões de upload e interface de controle).

Processamento de Arquivos: API nativa do HTML5 (FileReader).

Geração de PDF: html2pdf.js ou react-to-pdf (para "tirar uma foto" do HTML renderizado e salvar como PDF com múltiplas páginas).

4. Funcionalidades Principais (MVP)
Área de Dropzone: Um campo para arrastar e soltar o arquivo .md.

Parser de Mensagens: Um algoritmo usando Expressões Regulares (Regex) que entenda o padrão do WhatsApp (ex: [14/09/2026 23:20] Remetente: Mensagem).

Visualizador de Chat (Preview):

Mensagens do "Usuário A" alinhadas à direita (verde).

Mensagens do "Usuário B" alinhadas à esquerda (branco/cinza).

Botão "Exportar PDF": Converte a visualização atual em um documento PDF paginado e faz o download.