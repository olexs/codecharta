#!/usr/bin/env bash

analysis/gradlew -p analysis/ installDist

mkdir gh-pages/demo_files
cd gh-pages/demo_files || exit
CCSH=../../analysis/build/install/codecharta-analysis/bin/ccsh

git log --numstat --raw --topo-order --reverse -m > git.log
git ls-files > file-name-list.txt

# Data for for both visualization and analysis
$CCSH gitlogparser log-scan --git-log git.log --repo-files file-name-list.txt -o codecharta_git.cc.json -nc

# Map for analysis
$CCSH sonarimport -nc -o codecharta_sonar_analysis.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_analysis
$CCSH modify --set-root root/maibornwolff-gmbh_codecharta_analysis -o codecharta_sonar_mod.cc.json codecharta_sonar_analysis.cc.json
$CCSH modify --set-root root/analysis -o codecharta_git_mod.cc.json codecharta_git.cc.json
$CCSH merge -o ../visualization/app/codecharta_analysis.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json -nc
# Zipped map for pipeline build
$CCSH merge -o ../visualization/app/codecharta_analysis.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json

cd ../..
rm -r gh-pages/demo_files
