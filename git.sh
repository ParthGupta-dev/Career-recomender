#!bin/bash
echo "What is the name of commit?"
read update
git add .
sleep 2
git commit -m "$update"
sleep 3
git push
sleep 4
