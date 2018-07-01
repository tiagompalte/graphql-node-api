FROM node:10.3-alpine

#Setar a variável HOME
ENV HOME=/usr/src/app

#Copia o arquivo package.json
COPY package*.json $HOME/

#comando WORKDIR para dizer qual será o diretório da aplicação
WORKDIR $HOME
RUN npm install --silent --progress=false
ADD ./dist $HOME/dist

#Exporta a porta
EXPOSE 3000

#Comando de entrada da aplicação
ENTRYPOINT ["npm", "run"]