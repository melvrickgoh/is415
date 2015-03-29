# Geospatial Project

Node.js app using [Express 4](http://expressjs.com/).

Staging: geospatial-melvrick.herokuapp.com
Deployment: spatia.herokuapp.com

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:melvrickgoh/is415.git # or clone your own fork
$ cd is415
$ npm install
$ npm start
```
Next, contact me for the credentials required for the different APIs. Once that's settled, your app should now be running on [localhost:5000](http://localhost:5000/).

## Branching
Branching helps us to manage integrations especially since we're working on the same codebase

### Create a new branch
Create a new branch and codebase for your own use. "-b" indicates a new branch. "master" is the branch from which to replicate the codebase. Example:
```
git checkout -b feature/new_feature_branch_name master
```

### Checkout/Switch between branches
Switch between branhes via checkout. Local files will automatically be switched by git for you. Example:
```
git checkout ui/reorganize_legend_controls
```

### Things to do before merging to MASTER
The master branch is our deployed version on the server. Merging to MASTER requires you to make a PULL request. Before that, there is some cleanup to be done.

1. Commit all your changes to your branch
2. Fetch any other changes (committed by either of us collaborators with)
```
git fetch origin master
```
3. Merge these changes and resolve any differences
```
git merge origin/master
```
4. Make a pull request on [Github Pull Request](https://github.com/melvrickgoh/is415/pulls)
5. One of us collaborators will do a quick code review before sending it to our deployed server

After Merging
6. Delete the branch from tracking with the following. -d for soft delete. -D of force delete
```
git branch -d origin <delete_merged_branch_name>
```

### Useful: See the branch you're on
Show the branches available and the one you're on
```
git branch

* feature/google_integration
  master
```

### Useful: See branch commit details
```
git log --graph --oneline --all

*   1330bb8 Merge remote-tracking branch 'origin/master'
|\
| * b1903d6 Update IronCache.js
| * 4f5b954 Update GoogleServices.js
| * 00c83af Update GooglePlaces.js
| * 9c253bb Update FoursquareVenues.js
| * 435647e Delete googleapi-privatekey.pem
| * b7f44b0 Delete 27c9ad866018f539e4bd83b7bb39c8a0bdba862a.p12
* | f6e1cf1 added .env controls
|/
* 4f27ea2 scale
* f3c2cb7 project submission
* 50d889b changed sidebar
* 8f21a78 project submission
```

### Useful: See branch commits and get short SHA ID
```
git reflog

1330bb8 HEAD@{0}: merge origin/master: Merge made by the 'recursive' strategy.
f6e1cf1 HEAD@{1}: reset: moving to ORIG_HEAD
ecb9053 HEAD@{2}: merge origin/master: Merge made by the 'recursive' strategy.
f6e1cf1 HEAD@{3}: commit: added .env controls
4f27ea2 HEAD@{4}: commit: scale
f3c2cb7 HEAD@{5}: commit: project submission
50d889b HEAD@{6}: commit: changed sidebar
```

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
