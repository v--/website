from fabric.decorators import hosts
from fabric.operations import run, local
from fabric.context_managers import lcd
from fabric.contrib.project import rsync_project


def clean():
    local('rm -r dist/*')
    reconfigure()


def reconfigure():
    local('cp config.toml.example dist/config.toml')
    local('cp website.service.example dist/website.service')


def build():
    local('gulp build')


@hosts('http@ivasilev.net')
def deploy():
    build()
    run('sudo systemctl stop website.service')

    with lcd('dist'):
        rsync_project(
            local_dir='.',
            remote_dir='ivasilev.net',
            extra_opts='--copy-links',
            delete=True
        )

    run('sudo systemctl start website.service')
