import argparse
import json
import sys
from typing import Iterable

import pyalpm  # type: ignore


def iter_packages(repo: str) -> Iterable[dict[str, str]]:
    handle = pyalpm.Handle('/', '/var/lib/pacman')
    db = handle.register_syncdb(repo, pyalpm.SIG_PACKAGE)

    for pkg in db.pkgcache:
        yield dict(
            name=pkg.name,
            version=pkg.version,
            desc=pkg.desc,
            arch=pkg.arch,
        )


if __name__ == '__main__':
    parser = argparse.ArgumentParser(prog='dump-package-info')
    parser.add_argument('repo')
    args = parser.parse_args()
    json.dump(list(iter_packages(args.repo)), sys.stdout)
