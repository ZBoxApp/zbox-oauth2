FROM ubuntu:14.04
MAINTAINER Elias Nahum <elias@zboxapp.com>

# Remove sh to only use bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install Dependancies
RUN apt-get update && apt-get install -y build-essential python curl nano git

# Install NodeJS
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.2.2
ENV PORT 80
ENV NODE_ENV production

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash \
    && source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Setup the app
RUN mkdir /app
RUN cd /app

WORKDIR /app

ADD . /app

#RUN rm -rf /app/node_modules/ /app/public/js/ /app/public/css/ /app/public/plugins/
RUN npm install -g forever

ENTRYPOINT npm start

EXPOSE 80