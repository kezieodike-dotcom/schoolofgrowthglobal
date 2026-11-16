"""Import the remaining Leadership manuscripts to local, ignored LMS JSON.

Run with the bundled Python and -B. Default: build 003/016/017 and report the
misnamed 018 institutional profile as rejected. --verify-only checks the existing
JSON against freshly extracted originals without writing anything. No networking,
pricing changes, source edits, or embedded document instructions are performed.

The learner projection is id/title/modules. Every other top-level field is private.
Extraction, block rendering and reconstruction use import-specialist-courses.py.
"""
from __future__ import annotations

import argparse
from collections import Counter
from dataclasses import dataclass
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent.parent
AUDIT = ROOT / '.data/leadership-update-audit'
OUTPUT = ROOT / 'data/lms'
MAX_BYTES = 2 * 1024 * 1024
_spec = importlib.util.spec_from_file_location('_leadership_shared_import',
                                              Path(__file__).with_name('import-specialist-courses.py'))
shared = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = shared
_spec.loader.exec_module(shared)
require, sha256 = shared.require, shared.sha256


@dataclass(frozen=True)
class CourseSpec:
    id: str
    title: str
    filename: str
    modules: int
    questions: int
    quiz_start: str
    quiz_end: str


SPECS = (
    CourseSpec('leadership-003', 'Leadership Character', 'SGG COURSE - LEADERSHIP CHARACTER.docx',
               10, 10, 'FINAL COURSE KNOWLEDGE ASSESSMENT', 'FINAL REFLECTION AND PERSONAL COMMITMENT'),
    CourseSpec('leadership-016', 'Change Leadership', 'SGG COURSE - CHANGE LEADERSHIP.docx',
               21, 10, 'SECTION A: MULTIPLE-CHOICE QUESTIONS', 'SECTION B: PRACTICAL ASSESSMENT'),
    CourseSpec('leadership-017', 'Crisis Leadership', 'SGG COURSE-CRISIS LEADERSHIP.docx',
               16, 5, 'SECTION A: MULTIPLE-CHOICE QUESTIONS', 'SECTION B: PRACTICAL ASSESSMENT'),
)
REJECTED_FILENAME = 'SGG-COURSE -LEADERSHIP ACCOUNTABILITY.docx'
STANDALONE_QUESTION = re.compile(r'^(QUESTION\s+)(\d+)$', re.I)
PRIVATE = re.compile(r'correct\s*answer|answer\s*key|^explanation:|model\s*answer|facilitator.only|facilitator guide|suggested marking guidance', re.I)
RESPONSE = re.compile(r'^(?:Practical (?:Exercise|Assignment|Case Study):|(?:ASSIGNMENT|EXERCISE) \d+:|'
                      r'CASE STUDY \d+:|WEEK \d+:|PART \d+:|FINAL REFLECTION|FINAL COURSE PROJECT|'
                      r"LEARNER'S .*COMMITMENT)", re.I)


class LeadershipBuilder(shared.CourseBuilder):
    def __init__(self, spec, source):
        self.spec, self.source, self.lines = spec, source, source['lines']
        self.course = {'id': spec.id, 'title': spec.title, 'published': True, 'modules': [],
                       'assessmentGuidance': [], 'facilitatorGuide': [], 'sourceDecorations': [],
                       'sourceParagraphs': source['paragraphs'], 'sourceLines': self.lines,
                       'sourceTables': source['tables'], 'sourceAuxiliary': source['auxiliary'],
                       'sourceIssues': []}
        self.coverage, self.private, self.block_number = {}, set(), 0
        self.quiz, self.written = None, {}

    def parse_assessment(self):
        start = shared.find_line(self.lines, self.spec.quiz_start)
        stop = shared.find_line(self.lines, self.spec.quiz_end)
        self.course['answerKey'] = {}
        self.course['answerExplanations'] = {}
        questions, preamble, cursor = [], [start], start + 1
        while cursor < stop:
            if cursor in self.private:
                cursor += 1
                continue
            text = self.lines[cursor]['text']
            numbered = shared.QUESTION.fullmatch(text)
            standalone = STANDALONE_QUESTION.fullmatch(text)
            if not numbered and not standalone:
                require(not questions, f'{self.spec.id}: unparsed quiz line {cursor + 1}')
                preamble.append(cursor)
                cursor += 1
                continue
            number = int(numbered[2] if numbered else standalone[2])
            require(number == len(questions) + 1, 'Question numbering changed')
            qid = f'question-{number}'
            question = {'id': qid, 'prompt': '', 'options': []}
            locations = []
            if standalone:
                # Reconstruct QUESTION n from the actual public question ID.
                self.number_locations[qid] = (cursor, standalone[1])
                cursor += 1
                question['prompt'] = self.lines[cursor]['text']
                locations.append((cursor, ['prompt'], ''))
            else:
                question['prompt'] = numbered[3]
                locations.append((cursor, ['prompt'], numbered[1]))
            cursor += 1
            for expected in 'ABCD':
                option = shared.OPTION.fullmatch(self.lines[cursor]['text'])
                require(option is not None and option[2] == expected, f'{qid}: missing option {expected}')
                locations.append((cursor, ['options', len(question['options']), 'label'], option[1]))
                question['options'].append({'id': expected, 'label': option[3]})
                cursor += 1
            answer = shared.ANSWER.fullmatch(self.lines[cursor]['text'])
            require(answer is not None, f'{qid}: missing source correct answer')
            self.course['answerKey'][qid] = answer[1]
            self.hide(cursor, reason='correct_answer')
            cursor += 1
            while cursor < stop and self.lines[cursor]['text'].startswith('Explanation:'):
                self.course['answerExplanations'][qid] = self.lines[cursor]['text']
                self.hide(cursor, reason='answer_explanation')
                cursor += 1
            questions.append((question, locations))
        require(len(questions) == self.spec.questions, 'Objective question count changed')
        self.quiz = {'start': start, 'stop': stop, 'questions': questions, 'preamble': preamble}

    def quiz_lesson(self, mi):
        super().quiz_lesson(mi)
        li = len(self.course['modules'][mi]['lessons']) - 1
        for qi, (question, _) in enumerate(self.quiz['questions']):
            if question['id'] in self.number_locations:
                index, prefix = self.number_locations[question['id']]
                self.locate(index, ['modules', mi, 'lessons', li, 'blocks', 0,
                                    'metadata', 'questions', qi, 'id'],
                            'learner', 'quiz_number', offset=len('question-'), prefix=prefix)

    def partition(self, mi, start, stop):
        group = []

        def flush():
            if group:
                self.lesson(mi, group, response=bool(RESPONSE.match(self.lines[group[0]]['text'])))
                group.clear()

        i = start
        while i < stop:
            if i == self.quiz['start']:
                flush()
                self.quiz_lesson(mi)
                i = self.quiz['stop']
                continue
            if i not in self.private:
                text = self.lines[i]['text']
                if (text.isupper() and len(text) < 200 or RESPONSE.match(text) or
                        re.match(r'^(?:LESSON \d+:|(?:LECTURE )?\d+\.\d+[ :]|Module \d+ Key Takeaway)', text)):
                    flush()
                group.append(i)
            i += 1
        flush()

    def build(self):
        title = self.spec.title.casefold()
        require(any(row['text'].casefold() in {title, 'course: ' + title} for row in self.lines[:12]),
                f'{self.spec.id}: source title does not match {self.spec.title}')
        starts = [i for i, row in enumerate(self.lines) if shared.MODULE.fullmatch(row['text'])]
        require([int(shared.MODULE.fullmatch(self.lines[i]['text'])[1]) for i in starts]
                == list(range(1, self.spec.modules + 1)), 'Original module count/numbering changed')
        for i, row in enumerate(self.lines):
            if shared.DIVIDER.fullmatch(row['text']):
                self.hide(i, 'sourceDecorations', 'visual_divider')
        self.number_locations = {}
        self.parse_assessment()
        orientation = self.module('orientation', 'Course orientation')
        self.partition(orientation, 0, starts[0])
        topic_counts = []
        for n, (first, last) in enumerate(zip(starts, starts[1:] + [len(self.lines)]), 1):
            # 003's project is outside its ten teaching modules; retain an appendix.
            if self.spec.id == 'leadership-003' and n == 10:
                last = shared.find_line(self.lines, 'FINAL COURSE PROJECT: THE 30-DAY LEADERSHIP CHARACTER DEVELOPMENT PROJECT')
            match = shared.MODULE.fullmatch(self.lines[first]['text'])
            mi = self.module(f'module-{n}', match[2])
            self.locate(first, ['modules', mi, 'title'], 'learner', 'module_title',
                        prefix=self.lines[first]['text'][:-len(match[2])])
            topics = [self.lines[i]['text'] for i in range(first + 1, last)
                      if re.match(rf'^(?:LESSON \d+:|(?:LECTURE )?{n}\.\d+[ :])', self.lines[i]['text'])]
            topic_counts.append(len(topics))
            self.partition(mi, first + 1, last)
        if self.spec.id == 'leadership-003':
            application = self.module('application', 'Practical application, assessment and completion')
            self.partition(application, last, len(self.lines))
        self.course['sourceManifest'] = dict(self.source['manifest'], sourceTitle=self.spec.title,
            sourceModules=self.spec.modules, teachingModules=self.spec.modules,
            numberedTopics=sum(topic_counts), topicsPerModule=topic_counts,
            sourceEnding=self.lines[-1]['text'], renderingVerified=False)
        self.course['sourceIssues'] = ['No reference list or further-reading bibliography is supplied.']
        if self.spec.id in {'leadership-016', 'leadership-017'}:
            self.course['sourceIssues'] += [
                'No total learning hours or course duration is stated; the 30-day programme is retained as an activity.',
                'Practical assessment weights and a detailed marking rubric are not supplied.']
        self.course['coverageAudit'] = {
            'lineIdConvention': '1-based nonempty source text lines; Word table rows stay intact',
            'totalSourceLines': len(self.lines), 'allLinesAccountedFor': True,
            'teachingLinesLost': 0, 'lostLineIds': [],
            'counts': dict(Counter(row['visibility'] for row in self.coverage.values())),
            'lines': [self.coverage[i] for i in sorted(self.coverage)]}
        verify_course(self.course, self.source)
        return self.course


def verify_course(course, source):
    """Verify destinations against a fresh extraction, including the private key."""
    require(course['sourceLines'] == source['lines'], 'Archived source differs from fresh extraction')
    require(course['sourceParagraphs'] == source['paragraphs'], 'Source paragraphs changed')
    require(course['sourceTables'] == source['tables'] and course['sourceAuxiliary'] == source['auxiliary'],
            'Source tables/auxiliary changed')
    for key, value in source['manifest'].items():
        require(course['sourceManifest'].get(key) == value, f'Source manifest changed: {key}')
    shared.verify_course(course)
    key = [m[1] for row in source['lines'] if (m := shared.ANSWER.fullmatch(row['text']))]
    require(course['answerKey'] == {f'question-{i + 1}': value for i, value in enumerate(key)},
            'Private key differs from original correct answers')
    for module in course['modules']:
        for lesson in module['lessons']:
            for block in lesson['blocks']:
                for line in block.get('content', '').splitlines():
                    require(not PRIVATE.search(line), 'Private guidance leaked into learner content')
                if block['type'] == 'leadership_quiz':
                    require(set(block['metadata']) == {'questions'}, 'Unexpected quiz metadata')
                    for question in block['metadata']['questions']:
                        require(set(question) == {'id', 'prompt', 'options'}, 'Private quiz property')
                        require(all(set(o) == {'id', 'label'} for o in question['options']), 'Private option property')


def encoded(value):
    data = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    require(len(data) < MAX_BYTES, 'Output exceeds the strict 2 MiB limit')
    return data


def ignored(path):
    require(path.resolve().is_relative_to(ROOT), 'Output must stay in this repository')
    result = subprocess.run(['git', '-C', str(ROOT), 'check-ignore', '--quiet', '--', str(path)],
                            capture_output=True, check=False)
    require(result.returncode == 0, f'Output is not gitignored: {path}')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, default=Path.home() / 'Downloads')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args(argv)
    report = {'accepted': [], 'rejected': [], 'sourceFilesUnchanged': False}
    snapshots, courses = [], []
    for spec in SPECS:
        path = args.source_dir / spec.filename
        source = shared.extract_docx(path)
        snapshots.append((path, source['manifest']))
        course = LeadershipBuilder(spec, source).build()
        target = OUTPUT / f'{spec.id}.json'
        ignored(target)
        data = encoded(course)
        if args.verify_only:
            existing = json.loads(target.read_text(encoding='utf-8'))
            verify_course(existing, source)
            require(existing == course, f'{spec.id}: existing output differs from fresh reconstruction')
            require(target.stat().st_size < MAX_BYTES, 'Existing file exceeds size limit')
        courses.append((target, data))
        report['accepted'].append({'id': spec.id, 'title': spec.title,
            'sourceManifest': course['sourceManifest'], 'jsonBytes': len(data),
            'lessons': sum(len(m['lessons']) for m in course['modules']),
            'objectiveQuizQuestions': len(course['answerKey']),
            'reflectionBlocks': sum(b['type'] == 'reflection' for m in course['modules']
                                    for lesson in m['lessons'] for b in lesson['blocks']),
            'coverageAudit': {key: value for key, value in course['coverageAudit'].items() if key != 'lines'},
            'sourceIssues': course['sourceIssues']})
    path = args.source_dir / REJECTED_FILENAME
    rejected = shared.extract_docx(path)
    snapshots.append((path, rejected['manifest']))
    report['rejected'].append({'id': 'leadership-018', 'sourceManifest': rejected['manifest'],
        'reason': 'Misnamed institutional company profile, not a Leadership Accountability manuscript. No course JSON generated.',
        'firstLine': rejected['lines'][0]['text'],
        'documentStatus': [row['text'] for row in rejected['lines'] if row['text'].startswith('DOCUMENT STATUS:')],
        'moduleCount': sum(bool(shared.MODULE.fullmatch(row['text'])) for row in rejected['lines'])})
    require(not (OUTPUT / 'leadership-018.json').exists(), 'Rejected 018 has an unexpected existing course JSON; review it separately')
    for path, manifest in snapshots:
        require(sha256(path.read_bytes()) == manifest['sha256'] and path.stat().st_mtime_ns == manifest['mtimeNs'],
                f'Source changed during import: {path.name}')
    report['sourceFilesUnchanged'] = True
    if not args.verify_only:
        for target, data in courses:
            target.parent.mkdir(parents=True, exist_ok=True)
            staging = target.with_name('.' + target.name + '.staging.json')
            ignored(staging)
            staging.write_bytes(data)
            staging.replace(target)
        target = AUDIT / 'report.json'
        ignored(target)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(encoded(report))
    for item in report['accepted']:
        print(json.dumps({'id': item['id'], 'sourceModules': item['sourceManifest']['sourceModules'],
            'lessons': item['lessons'], 'quizQuestions': item['objectiveQuizQuestions'],
            'sourceLinesVerified': item['coverageAudit']['totalSourceLines'],
            'jsonBytes': item['jsonBytes'], 'teachingLinesLost': 0, 'verifiedExisting': args.verify_only}))
    print(json.dumps({'id': 'leadership-018', 'status': 'rejected_source_mismatch',
                      'sha256': rejected['manifest']['sha256'], 'sourceFilesUnchanged': True}))
    return 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    try:
        raise SystemExit(main())
    except (ValueError, OSError, IndexError, KeyError) as error:
        print(f'Leadership import failed: {error}', file=sys.stderr)
        raise SystemExit(1)
