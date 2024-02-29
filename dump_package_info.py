from typing import Iterable, IO
import argparse
import json
import re
import sys
import tarfile


def process_pkgtar_iter(file: IO[bytes]):
    key_name: str = ''
    content: str = ''

    while (raw_line := file.readline()):
        line: str = raw_line.decode('utf-8')

        if m := re.match(r'%(?P<key_name>\w+)%', line):
            if len(content) > 0:
                yield key_name, content.rstrip()
                content = ''

            key_name = m.groupdict()['key_name']
        else:
            content += line

    if len(content) > 0:
        yield key_name, content.rstrip()


def process_pkgtar(file: IO[bytes]):
    full_data = {
        key: value for key, value in process_pkgtar_iter(file)
    }

    return dict(
        name=full_data['NAME'],
        version=full_data['VERSION'],
        desc=full_data['DESC'],
        arch=full_data['ARCH']
    )


def iter_packages(repo: str) -> Iterable[dict[str, str]]:
    tar = tarfile.open(name=repo)

    for file_info in tar.getmembers():
        if file_info.isfile():
            if (file := tar.extractfile(file_info)):
                yield process_pkgtar(file)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='dump-package-info')
    parser.add_argument('repo')
    args = parser.parse_args()
    json.dump(
        list(iter_packages(args.repo)),
        sys.stdout
    )
