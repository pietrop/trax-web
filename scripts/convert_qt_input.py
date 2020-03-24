import os
import argparse
import json


def read_json_input(fileobj):
    return json.load(fileobj)


def shift_utts(utts, shift_time_in_seconds):
    for utt in utts:
        utt["utt_start"] = round(utt["utt_start"] + shift_time_in_seconds, 2)
        utt["utt_end"] = round(utt["utt_end"] + shift_time_in_seconds, 2)

        for word in utt["word_list"]:
            word["start"] = round(word["start"] + shift_time_in_seconds, 2)
            word["end"] = round(word["end"] + shift_time_in_seconds, 2)

    return utts


def convert_utts_to_wordlist(utts):
    wordlist = []
    for utt in utts:
        for i, word in enumerate(utt["word_list"]):
            if i == 0:
                word["speaker"] = utt["spk_id"]
            wordlist.append(word)

    return wordlist


def write_output(wordlist, output_fileobj, utts, utts_output_fileobj):
    json.dump(wordlist, output_fileobj)
    if utts_output_fileobj:
        json.dump(utts, utts_output_fileobj)


parser = argparse.ArgumentParser(description="Convert Trax QT json to the new structure the web-app expects.")
parser.add_argument("-i", "--utt_json", required=True, type=argparse.FileType("r"), help="utt input json file")
parser.add_argument(
    "-o", "--output", default="-", type=argparse.FileType("w"), help="output json file in the new format",
)
parser.add_argument(
    "-u", "--utts-output", default=None, type=argparse.FileType("w"), help="UTTs output json file in the new format",
)
parser.add_argument(
    "-s", "--shift-time", default=0, type=int, help="Shift all words by this amount of seconds.",
)

args = parser.parse_args()
utt_json = args.utt_json
output = args.output
utts_output = args.utts_output

utts = read_json_input(utt_json)
if args.shift_time != 0:
    utts = shift_utts(utts, args.shift_time)

wordlist = convert_utts_to_wordlist(utts)
write_output(wordlist, output, utts, utts_output)

utt_json.close()
output.close()
