#!/bin/bash

# prepare stuff
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y vim python3 python3-dev python3-pip stow
sudo rpi-update

# add PAT + PYTHON_KEYRING_BACKEND(for poetry) to bashrc
echo "export PAT=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" >> /home/pi/.bashrc
echo "export PYTHON_KEYRING_BACKEND=keyring.backends.fail.Keyring" >> /home/pi/.bashrc
source /home/pi/.bashrc

# install docker + docker compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
exec su -l $USER
docker run hello-world
rm get-docker.sh
sudo apt-get install docker-compose-plugin
docker compose version

# download repos
git clone "https://wederer:$PAT@github.com/wederer/dotfiles.git"
stow home/pi/dotfiles/tmux
stow home/pi/dotfiles/git
stow home/pi/dotfiles/vim
git clone "https://wederer:$PAT@github.com/tackyplates/tackyplates-backend.git"
git clone "https://wederer:$PAT@github.com/tackyplates/tackyplates-frontend.git"

# set-up poetry
curl -sSL https://install.python-poetry.org | python3 -
echo "export PATH="/home/pi/.local/bin:$PATH"" >> /home/pi/.bashrc
poetry source add piwheels https://www.piwheels.org/simple

