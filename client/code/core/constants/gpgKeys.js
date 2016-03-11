import GPGKey from 'code/core/classes/gpgKey';

export const KEY = '436BB513',
    KEYSERVERS = [
        new GPGKey('http://ivasilev.net/files/mail@ivasilev.net.gpg'),
        new GPGKey('http://pgp.mit.edu/pks/lookup?op=vindex&search=0x78630B3B436BB513'),
        new GPGKey('http://keys.gnupg.net/pks/lookup?search=mail%40ivasilev.net&op=vindex'),
        new GPGKey('http://pool.sks-keyservers.net/pks/lookup?search=mail%40ivasilev.net&op=vindex')
    ];
