# Pacman repositories
## a variety of packages, mostly my own software and AUR builds.

All packages are signed, so you can import my GPG key (436BB513) into the pacman keychain. You can find it:
* [On this server](/436BB513.gpg)
* [On pgp.mit.edu](http://pgp.mit.edu)
* [On keys.gnupg.net](http://keys.gnupg.net)
* [On pool.sks-keyservers.net](http://pool.sks-keyservers.net)

__Note:__ I mantain 'any', 'i686' and 'x86_64' repos. Each of them includes packages from 'any'. $arch can be replaced with any of the three

```ini
[ivasilev]
Server = http://ivasilev.net/pacman/$arch
```

## You can view the package list here:

{{packages}}

<div ng-repeat="(name, packages) in repos | orderBy: repo.name">
    ___{{name}}___

    <ol>
        <li ng-repeat="package in packages">
            __{{package.name}}:__ v{{package.version}}
        </li>
    </ol>
</div>
