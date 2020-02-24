import os
import argparse
import json


def read_json_input(fileobj):
    return json.load(fileobj)


def convert_utts_to_wordlist(utts):
    wordlist = []
    for utt in utts:
        for i, word in enumerate(utt["word_list"]):
            if i == 0:
                word["speaker"] = utt["spk_id"]
            wordlist.append(word)

    return wordlist


def write_output(data, fileobj):
    json.dump(data, fileobj)


parser = argparse.ArgumentParser(
    description="Convert Trax QT json to the new structure the web-app expects."
)
parser.add_argument(
    "-i", "--utt_json", required=True, type=argparse.FileType("r"), help="utt input json file"
)
parser.add_argument(
    "-o",
    "--output",
    default="-",
    type=argparse.FileType("w"),
    help="output json file in the new format",
)

args = parser.parse_args()
utt_json = args.utt_json
output = args.output

utts = read_json_input(utt_json)
wordlist = convert_utts_to_wordlist(utts)
write_output(wordlist, output)

utt_json.close()
output.close()
