export default {

    name: 'stat',

    actions: {

        get: {
            async handler(ctx) {
                const [position, ezwow, cookies, characters, races, classes] = await Promise.all([
                    this.broker.cacher.get('start.point'),
                    ctx.call('ezwow.stat'),
                    ctx.call('cookie.count'),
                    ctx.call('character.count'),
                    ctx.call('character.races'),
                    ctx.call('character.classes')
                ])
                return {
                    position, ezwow, cookies, characters, races, classes
                }
            }
        }

    }
}