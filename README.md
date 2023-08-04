# MassGitLeaker
Fast & Lightweight Github user repositories & repos credentials leaker with [trufflehog](https://github.com/trufflesecurity/trufflehog).

## Installation
Github:
```
git clone https://github.com/cspi-git/massgitleaker
```

NpmJS:
```
npm i argparse parallel-park request-async shelljs path fs
```

## Usage
```
usage: index.js [-h] [-u USER] [-r REPOS] -o OUTPUTDIR

You must choose at least one argument between --user & --repos

optional arguments:
  -h, --help            show this help message and exit
  -u USER, --user USER  Scan all of the repositories of the specified
                        user.
  -r REPOS, --repos REPOS
                        Scan the listed repositories.
  -o OUTPUTDIR, --outputDir OUTPUTDIR
                        Results directory output.
```

## License
MIT © CSPI