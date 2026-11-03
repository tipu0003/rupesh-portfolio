import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import URLError
import fetch_publications as updater


class RefreshTests(unittest.TestCase):
    def test_network_failure_keeps_saved_catalog_and_timestamp(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'catalog.json'
            original = '{"updated_at":"2026-10-01","publications":[{"title":"Saved work"}]}'
            output.write_text(original)
            with patch.object(updater, 'OUTPUTS', [output]), patch.object(updater, 'request_json', side_effect=URLError('offline')):
                with self.assertRaises(URLError):
                    updater.refresh()
            self.assertEqual(output.read_text(), original)

    def test_empty_response_does_not_replace_good_records(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'catalog.json'
            output.write_text('{"publications":[{"title":"Saved"}]}')
            with patch.object(updater, 'OUTPUTS', [output]), patch.object(updater, 'request_json', return_value={'group': []}):
                with self.assertRaises(ValueError):
                    updater.refresh()
            self.assertEqual(json.loads(output.read_text())['publications'][0]['title'], 'Saved')

    def test_missing_date_is_unknown_rather_than_an_invented_year(self):
        record = updater.normalize({'put-code':1,'title':{'title':{'value':'Test'}},'type':'journal-article'})
        self.assertIsNone(record['year'])
        self.assertEqual(record['publication_date'], '')


if __name__ == '__main__':
    unittest.main()
