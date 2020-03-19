from dataclasses import dataclass
from typing import List, NamedTuple, Optional
from uuid import uuid4
import random


MIN_TASK_DURATION = 10
MAX_TASK_DURATION = 40
MIN_TIME_BEFORE_AFTER = 7
MAX_TIME_BEFORE_AFTER = 15


@dataclass
class Word:
    word: str
    start: float
    end: float
    speaker: Optional[str]


class WordList:
    words: List[Word]

    def __init__(self, words: List[Word]):
        self.words = words

    @property
    def start_time(self):
        return self.words[0].start

    @property
    def end_time(self):
        return self.words[-1].end

    def __getitem__(self, item):
        return self.words[item]

    def word_near_time(self, time: float):
        for i, word in enumerate(self.words):
            if time < word.start or (time > word.start and time < word.end):
                return i, word

        return len(self.words) - 1, self.words[-1]


@dataclass
class TaskText:
    before: List[Word]
    editable: List[Word]
    after: List[Word]


@dataclass
class Task:
    id: str
    text: TaskText
    editable_start: float
    editable_end: float


class Manager:
    def __init__(self, wordlist: WordList):
        self.wordlist = wordlist

    def _get_before_text(self, editable_start_idx):
        start_time = self.wordlist[editable_start_idx].start
        before_time = start_time - random.uniform(MIN_TIME_BEFORE_AFTER, MAX_TIME_BEFORE_AFTER)
        before_time = before_time if before_time >= 0 else 0
        before_start_idx, word = self.wordlist.word_near_time(before_time)

        return self.wordlist[before_start_idx:editable_start_idx]

    def _get_after_text(self, editable_end_idx):
        end_time = self.wordlist[editable_end_idx].end
        after_time = end_time + random.uniform(MIN_TIME_BEFORE_AFTER, MAX_TIME_BEFORE_AFTER)
        after_time = after_time if after_time <= self.wordlist.end_time else self.wordlist.end_time
        after_end_idx, word = self.wordlist.word_near_time(after_time)

        return self.wordlist[editable_end_idx + 1 : after_end_idx]

    def get_random_task(self):
        duration = random.uniform(MIN_TASK_DURATION, MAX_TASK_DURATION)
        max_start = self.wordlist.end_time - duration
        start = random.uniform(self.wordlist.start_time, max_start)
        end = start + duration
        start_idx, start_word = self.wordlist.word_near_time(start)
        end_idx, end_word = self.wordlist.word_near_time(end)

        editable_words = self.wordlist[start_idx : end_idx + 1]
        before_words = self._get_before_text(start_idx)
        after_words = self._get_after_text(end_idx)

        task = Task(
            id=uuid4().hex,
            text=TaskText(before=before_words, editable=editable_words, after=after_words),
            editable_start=start_word.start,
            editable_end=end_word.end,
        )

        return task

