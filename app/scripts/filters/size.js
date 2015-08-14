application.filter('size', function() {
    return function(bytes) {
        if (bytes < 1024)
            return bytes + ' Bts';

        let sizes = 'KMGTP';
        let ratio = bytes;
        let lastRatio = null;

        for (let i in sizes)
        {
            lastRatio = ratio;
            ratio = lastRatio / 1024;

            if (ratio < 0.1)
                return (+((lastRatio * 100) | 0) / 100) + ' ' + sizes[i - 1] + 'iB';
        }

        return 'Invalid size';
    };
});
