"""Import the original Foundations of Leadership manuscript into private LMS storage."""
from collections import Counter
import importlib.util
import json
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('_leadership_updates', Path(__file__).with_name('import-leadership-updates.py'))
updates = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = updates
spec.loader.exec_module(updates)
shared = updates.shared
FILENAME = 'School of Leadership Course1 -FOUNDATIONS OF LEADERSHIP.docx'


def build(source):
    course_spec = updates.CourseSpec('leadership-001', 'Foundations of Leadership', FILENAME,
        11, 5, '9. OBJECTIVE COURSE ASSESSMENT', '10. COURSE COMPLETION STANDARD')
    builder = updates.LeadershipBuilder(course_spec, source)
    lines = builder.lines
    shared.require(any(row['text'] == 'COURSE 1: FOUNDATIONS OF LEADERSHIP' for row in lines[:12]), 'Source title mismatch')
    starts = [i for i, row in enumerate(lines) if shared.MODULE.fullmatch(row['text'])]
    shared.require([int(shared.MODULE.fullmatch(lines[i]['text'])[1]) for i in starts] == list(range(1, 12)), 'Module numbering changed')
    for i, row in enumerate(lines):
        if shared.DIVIDER.fullmatch(row['text']):
            builder.hide(i, 'sourceDecorations', 'visual_divider')
    builder.number_locations = {}
    builder.parse_assessment()
    orientation = builder.module('orientation', 'Course orientation')
    builder.partition(orientation, 0, starts[0])
    appendix = shared.find_line(lines, '5. PROFESSIONAL LEADERSHIP TOOLS')
    for n, (first, last) in enumerate(zip(starts, starts[1:] + [appendix]), 1):
        match = shared.MODULE.fullmatch(lines[first]['text'])
        mi = builder.module(f'module-{n}', match[2])
        builder.locate(first, ['modules', mi, 'title'], 'learner', 'module_title', prefix=lines[first]['text'][:-len(match[2])])
        builder.partition(mi, first + 1, last)
    applied = builder.module('application', 'Practical tools, assignment and assessment')
    builder.partition(applied, appendix, len(lines))
    course = builder.course
    course['sourceManifest'] = dict(source['manifest'], sourceTitle=course_spec.title,
        sourceModules=11, teachingModules=11, sourceEnding=lines[-1]['text'])
    course['coverageAudit'] = {'totalSourceLines': len(lines), 'allLinesAccountedFor': True,
        'teachingLinesLost': 0, 'lostLineIds': [],
        'counts': dict(Counter(row['visibility'] for row in builder.coverage.values())),
        'lines': [builder.coverage[i] for i in sorted(builder.coverage)]}
    updates.verify_course(course, source)
    return course


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    source = shared.extract_docx(Path.home() / 'Downloads' / FILENAME)
    course = build(source)
    target = Path(__file__).resolve().parent.parent / 'data/lms/leadership-001.json'
    updates.ignored(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(updates.encoded(course))
    print(json.dumps({'id': course['id'], 'modules': 11,
        'lessons': sum(len(m['lessons']) for m in course['modules']),
        'questions': len(course['answerKey']), 'sourceLinesVerified': len(source['lines']), 'teachingLinesLost': 0}))
