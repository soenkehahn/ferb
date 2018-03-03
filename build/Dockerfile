FROM golang:1.8.5-jessie
RUN apt-get update --yes && apt-get install --yes upx-ucl

ADD ./build /root/jsi/build
ADD ./src/ /root/jsi/src/

WORKDIR /root/jsi
CMD ./build/buildWithGo.sh && cat ./dist/bin/jsi
