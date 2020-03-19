import argparse
import json
from bottle import Bottle, request, response, run
from manager import Manager, WordList, Word
import dataclasses
from dataclasses import dataclass

@dataclass
class Term:
    term: str


class EnableCors(object):
    name = "enable_cors"
    api = 2

    def apply(self, fn, context):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
            response.headers[
                "Access-Control-Allow-Headers"
            ] = "Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token"

            if request.method != "OPTIONS":
                # actual request; reply with the actual response
                return fn(*args, **kwargs)

        return _enable_cors


def main():
    app = Bottle()

    # POST /tasks
    @app.post("/tasks")
    def fetch_new_task():
        task = manager.get_random_task()
        return dataclasses.asdict(task)


    # PUT /tasks/:id
    @app.put("/tasks/<id>")
    def publish_task():
        return ""


    # GET /glossary
    @app.get("/glossary")
    def get_glossary():
        return {
            "glossary": [dataclasses.asdict(term) for term in terms]
        }

    parser = argparse.ArgumentParser(description="Mock API server for Trax")
    parser.add_argument(
        "-u", "--utts", required=True, type=argparse.FileType("r"), help="wordlist JSON file",
    )
    parser.add_argument(
        "-t", "--terms", required=True, type=argparse.FileType("r"), help="terms JSON file",
    )
    parser.add_argument(
        "-p", "--port", default=8000, type=int, help="port to listen on",
    )
    args = parser.parse_args()

    words_json = json.load(args.utts)
    terms_json = json.load(args.terms)

    terms = [Term(term=t["term"]) for t in terms_json]
    words = [Word(word=w["word"], start=w["start"], end=w["end"], speaker=w.get("speaker")) for w in words_json]

    wordlist = WordList(words)
    manager = Manager(wordlist)

    args.utts.close()
    args.terms.close()

    
    app.install(EnableCors())
    run(app, host="localhost", port=8000, reloader=True)


if __name__ == "__main__":
    main()

