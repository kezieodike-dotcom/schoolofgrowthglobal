import copy
import importlib.util
from pathlib import Path
import sys
import unittest

sys.dont_write_bytecode = True
path = Path(__file__).with_name('import-leadership-foundations.py')
spec = importlib.util.spec_from_file_location('foundations_import', path)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

class FoundationsImportTests(unittest.TestCase):
    def test_full_manuscript_is_preserved_with_private_answers(self):
        source = module.shared.extract_docx(Path.home() / 'Downloads' / module.FILENAME)
        course = module.build(source)
        self.assertEqual(len(source['lines']), 928)
        self.assertEqual(course['sourceManifest']['sha256'], 'aea688d362faf3a0aeca081796cde43037a6e87b92b535c233ec5ed646643e71')
        self.assertEqual([m['id'] for m in course['modules'][1:12]], [f'module-{i}' for i in range(1, 12)])
        self.assertEqual(len(course['answerKey']), 5)
        module.shared.verify_course(course)
        public = str(course['modules'])
        self.assertNotIn('Correct Answer:', public)
        self.assertIn('Recommended pass mark: 70%', public)
        self.assertIn('PERSONAL LEADERSHIP ACTION PLAN', public)
        altered = copy.deepcopy(course)
        altered['modules'][0]['lessons'][0]['blocks'][0]['content'] = 'Changed source text'
        with self.assertRaises(ValueError):
            module.shared.verify_course(altered)

if __name__ == '__main__':
    unittest.main()
