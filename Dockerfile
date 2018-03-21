FROM node:8.9.4

#Cria um usuário app e instalar o npm
RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm@5.7.1

#Setar a variável HOME
ENV HOME=/home/app

#Copia o arquivo package.json e dá permissão para o usuário app sob a pasta do projeto pelo comando chown
COPY package*.json $HOME/backend/
RUN chown -R app:app $HOME/*

#comando USER para setar o usuário que foi criado
#comando WORKDIR para dizer qual será o diretório da aplicação
USER app
WORKDIR $HOME/backend
RUN npm install --silent --progress=false

#O comando COPY indica que o diretório que deve ser copiado para dentro da imagem
USER root
COPY /dist $HOME/backend
RUN chown -R app:app $HOME/*
USER app

#Exporta a porta
EXPOSE 3000

#Comando para subir a aplicação
CMD ["npm", "dev"]