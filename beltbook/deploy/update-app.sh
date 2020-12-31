#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=8192"
TARGET="${LC_COMMIT_HASH:-origin/master}"
. .bashrc
APP_DIR=~/BeltBook
cd "$APP_DIR"
echo "# Starting deployment."
#echo "# Target commit: ${TARGET}"
set -e # Fail the script on any errors.

printf "# Node version: $(node --version)\n"
printf "# NPM version: $(npm --version)\n"
echo "# Stashing local changes to tracked files."
git stash
echo "# Fetching remote."
git fetch --all
echo "# Checking out the specified commit."
git checkout "${TARGET}"

echo "# Activating virtualenv."
set +e # The activate script might return non-zero even on success.
. ~/venv/bin/activate
set -e
echo "# Installing pip requirements."
pip install -r requirements.txt

echo "# Navigating to the backend directory."
cd beltbook

echo "# Taking a database backup."
mkdir -p backups
if [ -f db.sqlite3 ]; then
  cp db.sqlite3 backups/db.sqlite3.bak_`date "+%Y-%m-%d"`
fi

echo "# Running makemigrations on 'main'"
python manage.py makemigrations main

echo "# Running database migrations."
python manage.py migrate --noinput

echo "# Navigating to the frontend directory."
cd frontend

echo "# Installing Node.js dependencies."
yarn install

echo "# Building the frontend project."
yarn run build

#echo "# Collecting static files."
cd "$APP_DIR"
cd beltbook
python manage.py collectstatic --noinput

echo "# Restarting the backend service."
sudo systemctl restart beltbook

set +e
echo "# Deployment done!"