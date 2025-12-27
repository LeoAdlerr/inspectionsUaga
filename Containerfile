# ====================================================================
# Containerfile de Produção para o Frontend (com Nginx)
# MOTIVAÇÃO: Este arquivo vive na raiz para contornar uma limitação
# do podman-compose e centralizar a lógica de build de produção.
# ====================================================================

# --- ESTÁGIO 1: O "BUILDER" ---
# Usamos uma imagem Node.js para construir nosso app Vue.
FROM node:20-slim AS builder

# Define o diretório de trabalho DENTRO deste estágio.
WORKDIR /app

# MOTIVAÇÃO: Os caminhos agora são relativos à raiz do projeto.
# Copiamos os arquivos de dependência do sub-repo do frontend.
COPY ./checklist-8-18-front/package.json ./checklist-8-18-front/yarn.lock ./
RUN yarn install --frozen-lockfile

# Copiamos todo o código-fonte do frontend para o contêiner.
COPY ./checklist-8-18-front/ .

# Executamos o build de produção.
RUN yarn build

# --- ESTÁGIO 2: O "FINAL" ---
# Começamos com uma imagem Nginx limpa e leve.
FROM nginx:stable-alpine

# Copiamos APENAS o resultado do build (/dist) do estágio anterior
# para a pasta pública do Nginx.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos a nossa configuração customizada do Nginx.
COPY ./checklist-8-18-front/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 e inicia o Nginx.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]