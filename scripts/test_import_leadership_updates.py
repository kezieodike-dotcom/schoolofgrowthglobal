"""Synthetic importer regression tests; contains no private manuscript text."""
import copy
import importlib.util
import sys
import unittest
from pathlib import Path


def importer():
    path = Path(__file__).with_name('import-leadership-updates.py')
    spec = importlib.util.spec_from_file_location('leadership_updates', path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def fixture(rows):
    return {'manifest': {'filename': 'synthetic.docx', 'sha256': '0' * 64},
            'paragraphs': ['\n'.join(rows)], 'tables': [], 'auxiliary': {},
            'lines': [{'id': f'L{i + 1:04d}', 'text': text, 'kind': 'text',
                       'paragraph': 'P0001'} for i, text in enumerate(rows)]}


class ImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.m = importer()

    def build(self, standalone=False):
        m = self.m
        spec = m.CourseSpec('leadership-099', 'Synthetic Leadership', 'synthetic.docx', 2, 1,
                            'SECTION A: MULTIPLE-CHOICE QUESTIONS',
                            'SECTION B: PRACTICAL ASSESSMENT')
        rows = ['COURSE: SYNTHETIC LEADERSHIP', '---',
                'MODULE 1: FOUNDATIONS', '1.1 First concept', 'Original teaching.',
                'Practical Assignment: Practice', 'Write your original response.',
                'MODULE 2: COURSE ASSESSMENT', spec.quiz_start,
                'Instruction: Select the most appropriate answer.']
        rows += ['QUESTION 1', 'Which fictional choice?'] if standalone else ['1. Which fictional choice?']
        rows += ['A. Alpha.', 'B. Beta.', 'C. Gamma.', 'D. Delta.', 'Correct Answer: B.',
                 'Explanation: Private explanation.', spec.quiz_end,
                 'Recommended Passing Mark: 70%.', 'COURSE CONCLUSION', 'Original ending.']
        source = fixture(rows)
        return m.LeadershipBuilder(spec, source).build(), source

    def test_preserves_every_line_and_original_module_order(self):
        course, source = self.build()
        self.m.verify_course(course, source)
        self.assertEqual([x['id'] for x in course['modules']], ['orientation', 'module-1', 'module-2'])
        self.assertEqual(course['coverageAudit']['totalSourceLines'], len(source['lines']))
        self.assertEqual(course['coverageAudit']['lostLineIds'], [])
        self.assertTrue(course['coverageAudit']['allLinesAccountedFor'])

    def test_both_question_formats_hide_answers_and_explanations(self):
        import json
        for standalone in (False, True):
            course, _ = self.build(standalone)
            self.assertEqual(course['answerKey'], {'question-1': 'B'})
            public = json.dumps(course['modules'])
            self.assertNotIn('Correct Answer:', public)
            self.assertNotIn('Private explanation.', public)
            self.assertIn('Which fictional choice?', public)
            blocks = [b for mod in course['modules'] for lesson in mod['lessons'] for b in lesson['blocks']]
            self.assertTrue(any(b['type'] == 'reflection' for b in blocks))
            quiz = next(b for b in blocks if b['type'] == 'leadership_quiz')
            self.assertEqual([o['id'] for o in quiz['metadata']['questions'][0]['options']], list('ABCD'))

    def test_reconstruction_detects_lost_teaching_and_forged_source_copy(self):
        course, source = self.build()
        course['modules'][1]['lessons'][1]['blocks'][0]['content'] = 'Changed teaching.'
        with self.assertRaises(ValueError):
            self.m.verify_course(course, source)
        course, source = self.build()
        course['sourceLines'][0]['text'] = 'Forged source archive'
        with self.assertRaises(ValueError):
            self.m.verify_course(course, source)

    def test_private_key_must_match_source(self):
        course, source = self.build()
        course['answerKey']['question-1'] = 'D'
        with self.assertRaises(ValueError):
            self.m.verify_course(course, source)

    def test_extra_private_metadata_cannot_leak_into_quiz(self):
        course, source = self.build()
        quiz = next(b for mod in course['modules'] for lesson in mod['lessons']
                    for b in lesson['blocks'] if b['type'] == 'leadership_quiz')
        quiz['metadata']['questions'][0]['correctAnswer'] = 'B'
        with self.assertRaises(ValueError):
            self.m.verify_course(course, source)

    def test_title_mismatch_is_rejected_before_build(self):
        course, source = self.build()
        spec = self.m.CourseSpec('leadership-018', 'Leadership Accountability', 'wrong.docx', 2, 1,
                                'SECTION A: MULTIPLE-CHOICE QUESTIONS',
                                'SECTION B: PRACTICAL ASSESSMENT')
        with self.assertRaisesRegex(ValueError, 'title|Title'):
            self.m.LeadershipBuilder(spec, source).build()

    def test_missing_option_or_duplicate_module_number_is_rejected(self):
        course, source = self.build()
        spec = self.m.CourseSpec('leadership-099', 'Synthetic Leadership', 'synthetic.docx', 2, 1,
                                'SECTION A: MULTIPLE-CHOICE QUESTIONS',
                                'SECTION B: PRACTICAL ASSESSMENT')
        for replacement, original in [('C. Missing B.', 'B. Beta.'),
                                      ('MODULE 1: COURSE ASSESSMENT', 'MODULE 2: COURSE ASSESSMENT')]:
            altered = copy.deepcopy(source)
            next(row for row in altered['lines'] if row['text'] == original)['text'] = replacement
            with self.assertRaises(ValueError):
                self.m.LeadershipBuilder(spec, altered).build()


if __name__ == '__main__':
    unittest.main()
