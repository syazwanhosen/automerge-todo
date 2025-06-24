## Installation

Clone the project, install its dependencies, and run `npm dev` to start the local dev server.

```bash
$ git clone https://github.com/syazwanhosen/automerge.git
# Cloning into automerge...
$ cd automerge
$ npm install
# Installing project dependencies...
$ npm run dev
# Starting Vite dev server...
```

Navigate to http://localhost:5173 to see the app running. 

You'll notice the URL change to append a hash with an Automerge document ID, e.g.:

`http://localhost:5173/#automerge:8SEjaEBFDZr5n4HzGQ312TWfhoq`

Open the same URL (including the document ID) in another tab or another browser to see each client's changes synchronize with all other active clients.