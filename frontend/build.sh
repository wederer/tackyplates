#!/bin/bash

LABOR="http://10.112.162.70:8000/"
LOKAL="http://localhost:8000/"
RPI_RGBG="http://192.168.1.51:8000/"

PS3='Wie soll das Frontend gebaut werden? '
options=("Labor URL" "Lokale URL" "RPI Wolfgang Regensburg" "Custom URL" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Labor URL")
            echo "Frontend wird mit Labor URL $LABOR neu gebaut..."
            REACT_APP_TACKY_URL=$LABOR yarn build
            break
            ;;
        "Lokale URL")
            echo "Frontend wird mit lokaler URL $LOKAL neu gebaut..."
            REACT_APP_TACKY_URL=$LOKAL yarn build
            break
            ;;
        "RPI Wolfgang Regensburg")
            echo "Frontend wird mit URL $RPI_RGBG neu gebaut..."
            REACT_APP_TACKY_URL=$RPI_RGBG yarn build
            break
            ;;
        "Custom URL")
            echo "Mit welcher URL soll das Frontend gebaut werden?"
            read url
            echo "Frontend wird mit URL $url neu gebaut..."
            REACT_APP_TACKY_URL=$url yarn build
            break
            ;;
        "Quit")
            break
            ;;
        *) echo "invalid option $REPLY";;
    esac
done

