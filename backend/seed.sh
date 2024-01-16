#!/bin/bash

fixtures=$(ls seed/)
while IFS= read -r fixture; do
    echo -n "Seeding "
    echo $fixture
    python3 manage.py loaddata seed/$fixture
done <<< "$fixtures"
