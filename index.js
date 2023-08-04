(async()=>{
    "use strict";

    // Dependencies
    const { ArgumentParser } = require("argparse")
    const { runJobs } = require("parallel-park")
    const request = require("request-async")
    const shellJS = require("shelljs")
    const path = require("path")
    const fs = require("fs")
    
    // Variables
    const settings = require("./settings.json")
    const parser = new ArgumentParser({
        description: "You must choose at least one argument between --user & --repos"
    })

    var massGitLeaker = {
        userRepos: [],
        page: 1,
        found: 0
    }
    
    var args;

    // Functions
    async function getUserRepositories(){
        var response = await request(`https://api.github.com/users/${args.user}/repos?per_page=50&page=${massGitLeaker.page}`, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36"
            }
        })

        response = JSON.parse(response.body)

        if(!response.length){
            if(!massGitLeaker.userRepos.length) return console.log("No repositories found in the user.")

            console.log(`${massGitLeaker.userRepos.length} repositories found in the user.`)
            console.log("Scanning the user repositories, please wait.")

            return scanRepositories(massGitLeaker.userRepos)
        }

        for( const repo of response ) massGitLeaker.userRepos.push(repo.html_url)

        massGitLeaker.page++
        getUserRepositories()
    }

    async function scanRepositories(repos){
        await runJobs(
            repos,
            async(repo)=>{
                var results = shellJS.exec(`${settings.trufflehogPath} git ${repo} --no-update`, { silent: true }).stdout
    
                if(results.match("Detector Type:")){
                    massGitLeaker.found++
                    console.log(`Found credentials in ${repo}`)
                    fs.writeFileSync(`${path.join(args.outputDir, repo.slice(19, repo.length).replace(".git", "").replace(/\//g, "-"))}.txt`, results, "utf8")
                }
            }
        )
    
        massGitLeaker.found ? console.log(`Found credentials in ${massGitLeaker.found} repositories.`) : console.log("No credentials found in repositories.")
    }
    
    // Main
    parser.add_argument("-u", "--user", { help: "Scan all of the repositories of the specified user." })
    parser.add_argument("-r", "--repos", { help: "Scan the listed repositories." })
    parser.add_argument("-o", "--outputDir", { help: "Results directory output.", required: true })

    args = parser.parse_args()

    if(!fs.existsSync(args.outputDir)) return console.log("Invalid outputDir.")
    
    if(args.user){
        console.log("Scraping the user repositories, please wait.")

        getUserRepositories()
    }else if(args.repos){
        if(!fs.existsSync(args.repos)) return console.log("Invalid repos.")
    
        const repos = fs.readFileSync(args.repos, "utf8").replace(/\r/g, "").split("\n")
        
        if(!repos.length) return console.log("repositories data is empty.")
        
        console.log("Scanning the repositories, please wait.")
        scanRepositories(repos)
    }else{
        console.log("Please choose at least 1 argument between --user & --repos")
    }
})()