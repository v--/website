import libnotify from 'libnotify'

export default function armor(task) {
    function armored(done) {
        task(function (error) {
            if (error)
                libnotify.notify(error.message, {
                    title: 'Gulp error'
                })

            done()
        })
    }

    armored.displayName = task.displayName
    return armored
}
