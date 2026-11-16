"""Import private specialist manuscripts without rewriting their teaching content.

Run with the bundled Python, for example:
  python -B scripts/import-specialist-courses.py --source-dir Downloads --output-dir data/lms

Only local ignored JSON is written. ``published`` is the existing LMS readiness
flag, not a publishing action. The public projection is ONLY id/title/modules;
all other top-level fields contain private source, assessment or audit material.
XML text is data: no document instructions, links, fields or macros are executed.
No third-party Python packages, source DOCX copies, or pricing changes are used.
"""
from __future__ import annotations

import argparse
from collections import Counter
from dataclasses import dataclass
import hashlib
from io import BytesIO
import json
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
NS = {'w': W[1:-1]}
MODULE = re.compile(r'^MODULE (\d+):\s*(.+)$')
QUESTION = re.compile(r'^((?:Question\s+)?(\d+)[.:]\s*)(\S.*)$', re.I)
OPTION = re.compile(r'^(([A-D])[.)]\s*)(\S.*)$')
ANSWER = re.compile(r'^Correct Answer:\s*([A-D])\.?$', re.I)
DIVIDER = re.compile(r'^[\s\-_=—–.]{3,}$')
PRIVATE_MARKERS = (
    'Correct Answer:', 'Suggested marking guidance:', 'FACILITATOR GUIDE',
    'Answer Guide:', 'MODEL ANSWER GUIDANCE', 'GUIDANCE FOR EVALUATION',
    'Expected Learning Direction:',
)


def require(condition, message):
    # Do not use Python assert: completeness checks must also run with python -O.
    if not condition:
        raise ValueError(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


@dataclass(frozen=True)
class CourseSpec:
    id: str
    title: str
    filename: str
    code: str
    modules: int
    topics: int
    appendix: str
    quiz_start: str
    quiz_end: str
    questions: int
    aliases: tuple[str, ...] = ()


SPECS = (
    CourseSpec('ai-001', 'Introduction to Artificial Intelligence and Its Applications',
               'SGG_Course_001_Introduction_to_Artificial_Intelligence_and_Its_Applications.docx',
               'SGG-FAI-001', 8, 45, 'PARTICIPANT WORKBOOK AND PRACTICAL ACTIVITIES',
               'Part A: Objective questions', 'Part B: Short-answer questions', 5),
    CourseSpec('ai-002', 'Generative AI and Prompt Engineering',
               'SGG_Course_002_Generative_AI_and_Prompt_Engineering.docx',
               'SGG-FAI-002', 8, 61, 'PARTICIPANT WORKBOOK AND PRACTICAL ACTIVITIES',
               'Part A: Objective questions', 'Part B: Short-answer questions', 10),
    CourseSpec('governance-001', 'Foundations of Governance',
               'SGG COURSE - FOUNDATIONS OF GOVERNANCE.docx', '001', 10, 46,
               'PART THREE: PRACTICAL LEARNING AND APPLICATION',
               '9. OBJECTIVE ASSESSMENT QUESTIONS', '10. SHORT-ANSWER AND ANALYTICAL QUESTIONS', 15),
    CourseSpec('governance-005', 'Public Accountability',
               'SGG COURSE- PUBLIC ACCOUNTABILITY.docx', '005', 10, 31,
               '5. PRACTICAL ACCOUNTABILITY TOOLS AND FRAMEWORKS',
               'Sample Objective Questions', '10. COURSE COMPLETION REQUIREMENTS', 10,
               ('SGG COURSE- PUBLIC ACCOUNTABILITY (1).docx',
                'SGG COURSE- PUBLIC ACCOUNTABILITY (2).docx')),
    CourseSpec('governance-013', 'Public Sector Management',
               'SGG COURSE-PUBLIC SECTOR MANAGEMENT (1).docx', '013', 10, 60,
               '6. INTERNATIONAL COMPARATIVE PERSPECTIVES',
               'A. Objective Questions', 'B. Short Answer Questions', 3),
    CourseSpec('governance-014', 'Policy Implementation',
               'SGG COURSE-POLICY IMPLEMENTATION.docx', '014', 10, 60,
               '6. INTERNATIONAL COMPARATIVE PERSPECTIVES',
               'A. Objective Questions', 'B. Short Answer Questions', 3),
    CourseSpec('governance-015', 'Policy Monitoring and Evaluation',
               'SGG COURSE -POLICY MONITORING AND EVALUATION.docx', '015', 10, 60,
               '6. INTERNATIONAL COMPARATIVE PERSPECTIVES',
               'A. Objective Assessment', 'B. Short Answer Assessment', 3),
)


def xml_text(element, include_deleted=False):
    pieces = []

    def visit(node):
        if node.tag in {W + 'del', W + 'moveFrom'} and not include_deleted:
            return
        if node.tag in {W + 't', W + 'delText'}:
            pieces.append(node.text or '')
        elif node.tag == W + 'tab':
            pieces.append('\t')
        elif node.tag in {W + 'br', W + 'cr'}:
            pieces.append('\n')
        else:
            for child in node:
                visit(child)

    visit(element)
    return ''.join(pieces).strip()


def extract_docx(path):
    """Read the ZIP in memory; retain actual Word tables as ordered cell rows."""
    raw = path.read_bytes()
    manifest = {'filename': path.name, 'sha256': sha256(raw), 'bytes': len(raw),
                'mtimeNs': path.stat().st_mtime_ns}
    with zipfile.ZipFile(BytesIO(raw), 'r') as archive:
        require(archive.testzip() is None, f'{path.name}: corrupt ZIP member')
        document = archive.read('word/document.xml')
        root = ET.fromstring(document)
        require(not root.findall('.//w:altChunk', NS), f'{path.name}: unsupported external document chunk')
        require(not root.findall('.//w:object', NS), f'{path.name}: embedded object requires source review')
        require(not root.findall('.//w:drawing', NS), f'{path.name}: drawing requires source review')
        body = root.find('w:body', NS)
        require(body is not None, f'{path.name}: missing document body')
        paragraphs = []
        paragraph_ids = {}
        revisions = []
        for paragraph in root.findall('.//w:p', NS):
            text = xml_text(paragraph)
            if text:
                paragraphs.append(text)
                paragraph_ids[id(paragraph)] = f'P{len(paragraphs):04d}'
            full_text = xml_text(paragraph, include_deleted=True)
            if text != full_text:
                revisions.append({'current': text, 'includingDeleted': full_text})
        require(not revisions, f'{path.name}: unresolved tracked deletions require source review')
        lines, tables = [], []

        def add(text, paragraph=None, kind='text', **extra):
            if text.strip():
                lines.append({'id': f'L{len(lines) + 1:04d}', 'text': text.strip(),
                              'paragraph': paragraph, 'kind': kind, **extra})

        def walk(node):
            if node.tag == W + 'p':
                numbered = node.find('w:pPr/w:numPr', NS) is not None
                for text in xml_text(node).splitlines():
                    add(text, paragraph_ids.get(id(node)), numbered=numbered)
            elif node.tag == W + 'tbl':
                table = []
                for row in node.findall('w:tr', NS):
                    cells = []
                    for cell in row.findall('w:tc', NS):
                        require(not cell.findall('.//w:tbl', NS), f'{path.name}: nested table requires source review')
                        cells.append('\n'.join(xml_text(p) for p in cell.findall('.//w:p', NS)))
                    table.append(cells)
                    add('|'.join(cells), kind='table_row', cells=cells,
                        table=len(tables), row=len(table) - 1)
                tables.append(table)
            else:
                for child in node:
                    walk(child)

        walk(body)
        auxiliary = {}
        for name in archive.namelist():
            if re.fullmatch(r'word/(?:header\d+|footer\d+|footnotes|endnotes|comments)\.xml', name):
                aux = ET.fromstring(archive.read(name))
                auxiliary[name] = [xml_text(p) for p in aux.findall('.//w:p', NS) if xml_text(p)]
        manifest.update(mainDocumentSha256=sha256(document), paragraphs=len(paragraphs),
                        lines=len(lines), wordTables=len(tables),
                        textSha256=sha256('\n'.join(row['text'] for row in lines).encode('utf-8')))
        return {'manifest': manifest, 'paragraphs': paragraphs, 'lines': lines,
                'tables': tables, 'auxiliary': auxiliary}


def find_line(lines, text):
    matches = [i for i, row in enumerate(lines) if row['text'] == text]
    require(len(matches) == 1, f'Expected one boundary {text!r}; found {len(matches)}')
    return matches[0]


def source_issues(spec):
    common = ['No course fee, currency or price is stated in this source.']
    if spec.id not in {'ai-001', 'ai-002', 'governance-001'}:
        common.append('Course duration and total learning hours are not stated; do not infer them from module count.')
    issues = {
        'ai-001': ['Historical development is promised but receives little substantive teaching coverage.',
                   'Part A contains written model answers, not multiple-choice options; instructor review is required.',
                   'The 100-point project rubric needs an explicit conversion to the 40-mark course component.'],
        'ai-002': ['Part A contains written model answers, not multiple-choice options; instructor review is required.',
                   'Part A question 3 refers to following choices but supplies no options.',
                   'The 100-point project rubric needs an explicit conversion to the 30-mark course component.'],
        'governance-001': ['Model-answer question labels do not consistently match analytical-question numbering.',
                           'Only five model-answer topics are provided for fifteen analytical questions.'],
        'governance-005': ['Three source files are duplicates; only one course is generated.',
                           'The weighted short-answer component has no separate question set.',
                           'Detailed project and written-assessment marking rubrics are not supplied.'],
        'governance-013': ['Original modules contain compact topic descriptions; no expanded lecture notes were added.',
                           'Twelve professional tools are named without complete templates.',
                           'Progression calls Course 005 Public Administration; supplied Course 005 is Public Accountability.',
                           'Progression calls Course 014 Public Service Reform and Modernisation; supplied Course 014 is Policy Implementation and Course 015 places Reform at 016.',
                           'Only three sample MCQs are provided; detailed project/written marking rubrics are absent.'],
        'governance-014': ['Original modules contain compact topic descriptions; no expanded lecture notes were added.',
                           'Twelve professional tools are named without complete templates.',
                           'Only three sample MCQs are provided; detailed project/written marking rubrics are absent.'],
        'governance-015': ['Original modules contain compact topic descriptions; no expanded lecture notes were added.',
                           'Fifteen professional tools are named without complete templates.',
                           'Only three sample MCQs are provided; detailed project scoring rubrics are absent.'],
    }
    return common + issues[spec.id]


class CourseBuilder:
    def __init__(self, spec, source):
        self.spec, self.source = spec, source
        self.lines = source['lines']
        self.course = {'id': spec.id, 'title': spec.title, 'published': True, 'modules': [],
                       'assessmentGuidance': [], 'facilitatorGuide': [], 'institutionalGuide': [],
                       'sourceDecorations': [], 'sourceParagraphs': source['paragraphs'],
                       'sourceLines': self.lines, 'sourceTables': source['tables'],
                       'sourceAuxiliary': source['auxiliary'], 'sourceIssues': source_issues(spec)}
        self.coverage = {}
        self.private = set()
        self.block_number = 0
        self.quiz = None
        self.written = {}

    def locate(self, index, path, visibility, kind='text', offset=None, prefix='', suffix=''):
        require(index not in self.coverage, f'{self.spec.id}: line {index + 1} assigned twice')
        self.coverage[index] = {'lineId': self.lines[index]['id'], 'visibility': visibility,
                                'kind': kind, 'destination': path,
                                'sha256': sha256(self.lines[index]['text'].encode('utf-8')),
                                'prefix': prefix, 'suffix': suffix}
        if offset is not None:
            self.coverage[index]['offset'] = offset
            self.coverage[index]['length'] = len(self.lines[index]['text'])

    def hide(self, index, field='assessmentGuidance', reason='model_or_marking_guidance'):
        if index in self.private:
            return
        values = self.course[field]
        values.append(self.lines[index]['text'])
        self.locate(index, [field, len(values) - 1], 'private', reason)
        self.private.add(index)

    def hide_range(self, start, stop, field, reason):
        for i in range(start, stop):
            self.hide(i, field, reason)

    def classify_private(self):
        for i, row in enumerate(self.lines):
            if DIVIDER.fullmatch(row['text']):
                self.hide(i, 'sourceDecorations', 'visual_divider')
            elif row['text'].startswith('Suggested marking guidance:'):
                self.hide(i)
        if self.spec.id.startswith('ai-'):
            start = find_line(self.lines, 'FACILITATOR GUIDE')
            stop = find_line(self.lines, 'COMPLETION AND CERTIFICATION REQUIREMENTS')
            self.hide_range(start, stop, 'facilitatorGuide', 'facilitator_only')
            qa = find_line(self.lines, 'INSTITUTIONAL QUALITY ASSURANCE')
            end = next(i for i in range(qa, len(self.lines)) if self.lines[i]['text'].startswith('End of Course '))
            self.hide_range(qa, end, 'institutionalGuide', 'institutional_quality_assurance')
        if self.spec.id == 'governance-001':
            start = find_line(self.lines, 'GUIDANCE FOR EVALUATION')
            stop = find_line(self.lines, 'PART SEVEN: ACADEMIC REFERENCES AND FURTHER READING')
            self.hide_range(start, stop, 'assessmentGuidance', 'case_evaluation_and_model_answers')
        if self.spec.id == 'governance-005':
            for i, row in enumerate(self.lines):
                if row['text'] == 'Learning Focus':
                    self.hide_range(i, i + 2, 'assessmentGuidance', 'case_answer_direction')
        if self.spec.id == 'governance-015':
            for i, row in enumerate(self.lines):
                if row['text'] in {'Answer Guide:', 'Expected Learning Direction:'}:
                    self.hide_range(i, i + 2, 'assessmentGuidance', 'written_or_case_model_answer')

    def parse_assessment(self):
        start = find_line(self.lines, self.spec.quiz_start)
        stop = find_line(self.lines, self.spec.quiz_end)
        if self.spec.id.startswith('ai-'):
            self.course['writtenAnswerGuide'] = {}
            questions = [i for i in range(start + 1, stop) if QUESTION.fullmatch(self.lines[i]['text'])]
            require(len(questions) == self.spec.questions, f'{self.spec.id}: written question count changed')
            for n, (first, last) in enumerate(zip(questions, questions[1:] + [stop]), 1):
                match = QUESTION.fullmatch(self.lines[first]['text'])
                require(int(match[2]) == n, f'{self.spec.id}: written question numbering changed')
                qid = f'question-{n}'
                self.written[first] = qid
                answers = [i for i in range(first + 1, last) if i not in self.private]
                require(answers, f'{self.spec.id}: missing written model answer {qid}')
                self.course['writtenAnswerGuide'][qid] = []
                for i in answers:
                    items = self.course['writtenAnswerGuide'][qid]
                    items.append(self.lines[i]['text'])
                    self.locate(i, ['writtenAnswerGuide', qid, len(items) - 1], 'private', 'written_model_answer')
                    self.private.add(i)
            self.course['assessmentReview'] = {'writtenAssessmentStatus': 'instructor_review_required',
                                               'autoMarkWrittenAssessment': False}
            return
        self.course['answerKey'] = {}
        # The Foundations section title starts with "9."; it is a heading,
        # not objective question nine.
        questions, preamble = [], [start]
        cursor = start + 1
        while cursor < stop:
            if cursor in self.private:
                cursor += 1
                continue
            match = QUESTION.fullmatch(self.lines[cursor]['text'])
            if not match:
                require(not questions, f'{self.spec.id}: unparsed quiz content at {self.lines[cursor]["id"]}')
                preamble.append(cursor)
                cursor += 1
                continue
            qid = f'question-{match[2]}'
            require(qid == f'question-{len(questions) + 1}', f'{self.spec.id}: quiz numbering changed')
            question = {'id': qid, 'prompt': match[3], 'options': []}
            locations = [(cursor, ['prompt'], match[1])]
            cursor += 1
            for expected in 'ABCD':
                option = OPTION.fullmatch(self.lines[cursor]['text'])
                require(option is not None and option[2] == expected, f'{self.spec.id}: missing option {expected} for {qid}')
                locations.append((cursor, ['options', len(question['options']), 'label'], option[1]))
                question['options'].append({'id': option[2], 'label': option[3]})
                cursor += 1
            answer = ANSWER.fullmatch(self.lines[cursor]['text'])
            require(answer is not None, f'{self.spec.id}: missing correct answer for {qid}')
            self.course['answerKey'][qid] = answer[1]
            self.hide(cursor, reason='correct_answer')
            questions.append((question, locations))
            cursor += 1
            while cursor < stop and self.lines[cursor]['text'].startswith('Explanation:'):
                self.hide(cursor, reason='answer_explanation')
                cursor += 1
        require(len(questions) == self.spec.questions, f'{self.spec.id}: objective question count changed')
        self.quiz = {'start': start, 'stop': stop, 'questions': questions, 'preamble': preamble}

    def module(self, mid, title):
        self.course['modules'].append({'id': mid, 'title': title, 'lessons': []})
        return len(self.course['modules']) - 1

    def block(self, lesson, kind, content, metadata=None):
        self.block_number += 1
        block = {'id': f'block-{self.block_number}', 'type': kind, 'content': content}
        if metadata is not None:
            block['metadata'] = metadata
        lesson['blocks'].append(block)
        return len(lesson['blocks']) - 1

    def row_kind(self, row):
        text = row['text']
        if row['kind'] == 'table_row' or '|' in text or '\t' in text:
            return 'table'
        if row.get('numbered') or re.match(r'^(?:[-•]\s+|\d+\.\s+)', text) and not text.isupper():
            return 'list'
        if text.isupper() and len(text) < 200 or re.match(r'^(?:LECTURE|Lecture) \d+\.', text):
            return 'heading'
        return 'reading'

    def lesson(self, mi, indexes, title=None, response=False):
        if not indexes:
            return
        module = self.course['modules'][mi]
        li = len(module['lessons'])
        lesson = {'id': f'{module["id"]}-lesson-{li + 1}',
                  'title': title or self.lines[indexes[0]]['text'], 'blocks': []}
        module['lessons'].append(lesson)
        cursor = 0
        while cursor < len(indexes):
            kind = self.row_kind(self.lines[indexes[cursor]])
            group = [indexes[cursor]]
            cursor += 1
            while cursor < len(indexes) and kind != 'heading' and self.row_kind(self.lines[indexes[cursor]]) == kind:
                # Keep actual XML rows separate from textual pipe/tab tables.
                if (self.lines[indexes[cursor]]['kind'] == 'table_row') != (self.lines[group[0]]['kind'] == 'table_row'):
                    break
                if self.lines[indexes[cursor]]['kind'] == 'table_row' and self.lines[indexes[cursor]]['table'] != self.lines[group[0]]['table']:
                    break
                group.append(indexes[cursor])
                cursor += 1
            rows = [self.lines[i]['text'] for i in group]
            separator = '\n\n' if kind == 'reading' else '\n'
            metadata = None
            actual_table = self.lines[group[0]]['kind'] == 'table_row'
            if kind == 'table':
                cells = [self.lines[i]['cells'] if actual_table else re.split(r'\||\t', self.lines[i]['text']) for i in group]
                metadata = {'rows': cells}
                if actual_table:
                    rows = ['|'.join(cell.replace('\n', '<br>') for cell in row) for row in cells]
            bi = self.block(lesson, kind, separator.join(rows), metadata)
            offset = 0
            for ri, i in enumerate(group):
                base = ['modules', mi, 'lessons', li, 'blocks', bi]
                if actual_table:
                    self.locate(i, base + ['metadata', 'rows', ri], 'learner', 'table_row')
                else:
                    self.locate(i, base + ['content'], 'learner', offset=offset)
                offset += len(rows[ri]) + len(separator)
        if response:
            self.block(lesson, 'reflection',
                       'Record your response to the original prompt above. Instructor review required.',
                       {'reviewStatus': 'instructor_review_required', 'assessmentType': 'written',
                        'questionIds': [self.written[i] for i in indexes if i in self.written]})

    def quiz_lesson(self, mi):
        quiz = self.quiz
        module = self.course['modules'][mi]
        li = len(module['lessons'])
        lesson = {'id': f'{module["id"]}-lesson-{li + 1}', 'title': 'Objective assessment', 'blocks': []}
        module['lessons'].append(lesson)
        preamble = [self.lines[i]['text'] for i in quiz['preamble']]
        bi = self.block(lesson, 'leadership_quiz', '\n\n'.join(preamble),
                        {'questions': [question for question, _ in quiz['questions']]})
        base = ['modules', mi, 'lessons', li, 'blocks', bi]
        offset = 0
        for i, text in zip(quiz['preamble'], preamble):
            self.locate(i, base + ['content'], 'learner', offset=offset)
            offset += len(text) + 2
        for qi, (_, locations) in enumerate(quiz['questions']):
            for i, tail, prefix in locations:
                self.locate(i, base + ['metadata', 'questions', qi] + tail, 'learner', 'quiz_text', prefix=prefix)

    def partition(self, mi, start, stop, teaching_number=None):
        group = []

        def flush():
            if not group:
                return
            first = self.lines[group[0]]['text']
            response = any(i in self.written for i in group) or any(re.match(
                r'^(?:Practical exercise\b|Workbook activity\b|Final reflection$|Write a short reflection)', self.lines[i]['text'], re.I) for i in group)
            if not teaching_number and re.search(r'assignment|project|exercise|activity|reflection|short.answer|analytical questions|case stud|template', first, re.I):
                response = response or not re.search(r'rubric|assessment structure', first, re.I)
            self.lesson(mi, group, response=response)
            group.clear()

        i = start
        while i < stop:
            if self.quiz and i == self.quiz['start']:
                flush()
                self.quiz_lesson(mi)
                i = self.quiz['stop']
                continue
            if i in self.private:
                i += 1
                continue
            text = self.lines[i]['text']
            if teaching_number:
                split = bool(re.match(rf'^(?:(?:LECTURE|Lecture) )?{teaching_number}\.\d+(?::| )', text))
            else:
                split = bool(text.isupper() and len(text) < 200 or re.match(
                    r'^(?:\d+\. [A-Z][A-Z ,&—–-]+$|Part [ABC]:|[ABC]\. (?:Objective|Short|Case)|'
                    r'Workbook activity \d+:|Case Study \d+:|Assignment \d+:|EXERCISE \d+:|'
                    r'Project assessment rubric$|Practical project assessment rubric$|Sample Objective Questions$)', text))
            if i in self.written:
                split = True
            if split:
                flush()
            group.append(i)
            i += 1
        flush()

    def build(self):
        endings = {
            'ai-001': 'End of Course 001: Introduction to Artificial Intelligence and Its Applications.',
            'ai-002': 'End of Course 002: Generative AI and Prompt Engineering.',
            'governance-001': 'Knowledge. Capability. Institutional Excellence. Measurable Impact.',
            'governance-005': 'Leadership. Strategy. Transformation.',
            'governance-013': 'This course will build on the management principles developed here by examining how governments restructure institutions, modernise administrative systems, improve public service capacity and transform traditional bureaucracies into efficient, innovative and responsive public institutions.',
            'governance-014': 'This course will build on policy implementation by examining how governments systematically track policy progress, measure results, evaluate effectiveness, identify implementation gaps and use evidence to improve public policies and development programmes.',
            'governance-015': 'Faculty of Governance, Public Leadership & Institutional Transformation',
        }
        require(self.lines[-1]['text'] == endings[self.spec.id], f'{self.spec.id}: source ending changed or is truncated')
        titles = [row['text'] for row in self.lines if row['text'].startswith('Course title:')]
        if titles:
            require(titles == ['Course title: ' + self.spec.title], f'{self.spec.id}: course title changed')
            require(any(row['text'] == 'Course code: ' + self.spec.code for row in self.lines), f'{self.spec.id}: source code changed')
        else:
            require(any(row['text'].casefold() == f'COURSE {self.spec.code}: {self.spec.title}'.casefold() for row in self.lines), f'{self.spec.id}: source title/code changed')
        appendix = find_line(self.lines, self.spec.appendix)
        starts = [i for i, row in enumerate(self.lines[:appendix]) if MODULE.fullmatch(row['text'])]
        require([int(MODULE.fullmatch(self.lines[i]['text'])[1]) for i in starts] == list(range(1, self.spec.modules + 1)), f'{self.spec.id}: module numbering changed')
        self.classify_private()
        self.parse_assessment()
        orientation = self.module('orientation', 'Course orientation')
        self.lesson(orientation, [i for i in range(starts[0]) if i not in self.private], 'Course overview')
        topic_counts = []
        for number, (start, stop) in enumerate(zip(starts, starts[1:] + [appendix]), 1):
            module = self.module(f'module-{number}', MODULE.fullmatch(self.lines[start]['text'])[2])
            topics = [i for i in range(start + 1, stop) if re.match(rf'^(?:(?:LECTURE|Lecture) )?{number}\.\d+(?::| )', self.lines[i]['text'])]
            require([int(re.search(r'\.(\d+)', self.lines[i]['text'])[1]) for i in topics] == list(range(1, len(topics) + 1)), f'{self.spec.id}: topic numbering changed in module {number}')
            topic_counts.append(len(topics))
            self.partition(module, start, stop, number)
        require(sum(topic_counts) == self.spec.topics, f'{self.spec.id}: topic count changed')
        application = self.module('application', 'Practical application, assessment and resources')
        self.partition(application, appendix, len(self.lines))
        manifest = dict(self.source['manifest'])
        manifest.update(sourceCourseCode=self.spec.code, sourceTitle=self.spec.title,
                        teachingModules=self.spec.modules, numberedTopics=sum(topic_counts),
                        topicsPerModule=topic_counts,
                        durationStatements=[{'lineId': row['id'], 'text': row['text']} for row in self.lines
                                            if re.match(r'^(?:Recommended [Dd]uration|Estimated learning time):', row['text'])],
                        renderingVerified=False, sourceEndingPresent=True)
        self.course['sourceManifest'] = manifest
        self.course['coverageAudit'] = {
            'lineIdConvention': '1-based nonempty source text lines; Word table rows stay intact',
            'totalSourceLines': len(self.lines), 'allLinesAccountedFor': True,
            'teachingLinesLost': 0, 'lostLineIds': [],
            'counts': dict(Counter(item['visibility'] for item in self.coverage.values())),
            'lines': [self.coverage[i] for i in sorted(self.coverage)],
        }
        verify_course(self.course)
        return self.course


def get_path(value, path):
    for key in path:
        value = value[key]
    return value


def verify_course(course):
    """Reconstruct each source line from its actual output destination, not a consumed flag."""
    require(course.get('published') is True, 'Missing LMS local readiness flag')
    modules = course['modules']
    require(modules and modules[0]['id'] == 'orientation', 'First module must be orientation')
    seen_modules, seen_lessons, seen_blocks, quiz_ids = set(), set(), set(), set()
    for module in modules:
        require(module['id'] not in seen_modules and module['title'] and module['lessons'], 'Invalid module')
        seen_modules.add(module['id'])
        for lesson in module['lessons']:
            require(lesson['id'] not in seen_lessons and lesson['title'] and lesson['blocks'], 'Invalid lesson')
            seen_lessons.add(lesson['id'])
            require(any(block.get('content', '').strip() for block in lesson['blocks']), 'Empty lesson')
            for block in lesson['blocks']:
                require(block['id'] not in seen_blocks and block['type'], 'Invalid block')
                seen_blocks.add(block['id'])
                for value in (module['id'], lesson['id'], block['id']):
                    require(re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', value), f'Invalid LMS ID: {value}')
                if block['type'] == 'leadership_quiz':
                    for q in block['metadata']['questions']:
                        require(q['id'] not in quiz_ids, 'Duplicate quiz question ID')
                        quiz_ids.add(q['id'])
                        require([o['id'] for o in q['options']] == list('ABCD'), 'Invalid quiz choices')
    public = json.dumps(modules, ensure_ascii=False)
    for marker in PRIVATE_MARKERS:
        require(marker not in public, f'Private assessment marker leaked: {marker}')
    if course['id'].startswith('ai-'):
        require(not quiz_ids and 'answerKey' not in course, 'Written AI assessment must not be auto-marked')
        require('Instructor review required.' in public, 'Missing student-facing review status')
        require(course['writtenAnswerGuide'], 'Missing private written model answers')
    else:
        require(quiz_ids == set(course['answerKey']), 'Quiz and private key IDs differ')
        require(all(value in 'ABCD' and len(value) == 1 for value in course['answerKey'].values()), 'Invalid correct choice')
    source = course['sourceLines']
    coverage = course['coverageAudit']
    require(len(coverage['lines']) == len(source) == coverage['totalSourceLines'], 'Incomplete per-line coverage')
    require([row['lineId'] for row in coverage['lines']] == [row['id'] for row in source], 'Source line coverage order mismatch')
    learner_count = 0
    for original, record in zip(source, coverage['lines']):
        learner = record['visibility'] == 'learner'
        require((record['destination'][0] == 'modules') == learner, 'Private/public coverage destination mismatch')
        value = get_path(course, record['destination'])
        if record['kind'] == 'table_row':
            value = '|'.join(value)
        if 'offset' in record:
            value = value[record['offset']:record['offset'] + record['length']]
        value = record['prefix'] + value + record['suffix']
        require(value == original['text'], f'{course["id"]}: lost/changed source text at {original["id"]}')
        require(sha256(value.encode('utf-8')) == record['sha256'], f'{original["id"]}: checksum mismatch')
        learner_count += int(learner)
        if record['visibility'] == 'private' and record['kind'] == 'text':
            raise ValueError(f'Unclassified private teaching text at {original["id"]}')
    require(learner_count > 0, 'No original learner content preserved')
    require(coverage['allLinesAccountedFor'] and coverage['teachingLinesLost'] == 0
            and coverage['lostLineIds'] == [], 'Coverage did not pass')


def import_courses(source_dir):
    courses, snapshots = [], []
    for spec in SPECS:
        path = source_dir / spec.filename
        source = extract_docx(path)
        snapshots.append((path, source['manifest']))
        aliases = []
        for filename in spec.aliases:
            alias_path = source_dir / filename
            if not alias_path.is_file():
                continue
            alias = extract_docx(alias_path)
            require(alias['manifest']['sha256'] == source['manifest']['sha256'],
                    f'{filename}: revised Public Accountability source detected; select/review a revision explicitly')
            aliases.append(alias['manifest'])
            snapshots.append((alias_path, alias['manifest']))
        course = CourseBuilder(spec, source).build()
        course['sourceManifest']['duplicateSources'] = aliases
        course['sourceManifest']['duplicateComparison'] = 'byte_identical_sha256' if aliases else 'no_alias_supplied'
        courses.append(course)
    for path, manifest in snapshots:
        require(sha256(path.read_bytes()) == manifest['sha256'] and path.stat().st_mtime_ns == manifest['mtimeNs'],
                f'Source changed while importing: {path.name}; no outputs were written')
    return courses


def ensure_private_output(output_dir):
    root = Path(__file__).resolve().parent.parent
    resolved = output_dir.resolve()
    require(resolved.is_relative_to(root), 'Output must remain inside this repository in an ignored directory')
    probe = resolved / 'source-privacy-check.json'
    result = subprocess.run(['git', '-C', str(root), 'check-ignore', '--quiet', '--', str(probe)],
                            capture_output=True, check=False)
    require(result.returncode == 0, 'Output JSON must be git-ignored to keep manuscripts private')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--source-dir', default=str(Path.home() / 'Downloads'), type=Path)
    parser.add_argument('--output-dir', default=Path('data/lms'), type=Path)
    parser.add_argument('--verify-only', action='store_true', help='Extract and verify everything without writing JSON')
    args = parser.parse_args(argv)
    source_dir = args.source_dir.expanduser()
    if str(source_dir).casefold() == 'downloads' and not source_dir.is_dir():
        source_dir = Path.home() / 'Downloads'
    ensure_private_output(args.output_dir)
    courses = import_courses(source_dir.resolve())
    if not args.verify_only:
        args.output_dir.mkdir(parents=True, exist_ok=True)
        for course in courses:
            # Atomic replacement; the staging artifact is also an ignored JSON.
            target = args.output_dir / f'{course["id"]}.json'
            staging = args.output_dir / f'.{course["id"]}.staging.json'
            staging.write_text(json.dumps(course, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            staging.replace(target)
    for course in courses:
        print(json.dumps({'course': course['id'], 'teachingModules': course['sourceManifest']['teachingModules'],
                          'numberedTopics': course['sourceManifest']['numberedTopics'],
                          'lessons': sum(len(module['lessons']) for module in course['modules']),
                          'objectiveQuizQuestions': len(course.get('answerKey', {})),
                          'writtenPartAQuestions': len(course.get('writtenAnswerGuide', {})),
                          'sourceLinesVerified': course['coverageAudit']['totalSourceLines'],
                          'sourceFilesVerified': 1 + len(course['sourceManifest']['duplicateSources']),
                          'teachingLinesLost': 0, 'written': not args.verify_only}, ensure_ascii=True))
    return 0


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    try:
        raise SystemExit(main())
    except (ValueError, OSError, zipfile.BadZipFile, ET.ParseError) as error:
        print(f'Import failed: {error}', file=sys.stderr)
        raise SystemExit(1)
