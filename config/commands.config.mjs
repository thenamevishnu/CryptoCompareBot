export const commands = {
    crypto: [
        {
            command: '/start',
            description: 'Start bot and register user'
        },
        {
            command: '/p',
            description: 'Get cryptocurrency price information'
        },
        {
            command: '/price',
            description: 'Get cryptocurrency price information'
        },
        {
            command: '/calc',
            description: 'Calculate crypto conversions'
        },
        {
            command: '/chart',
            description: 'Get cryptocurrency price chart'
        },
        {
            command: '/trending',
            description: 'Show trending cryptocurrencies'
        },
        {
            command: '/gas',
            description: 'Get Ethereum gas prices'
        }
    ],
    fun: [
        {
            command: '/joke',
            description: 'Get a random joke'
        },
        {
            command: '/coin_flip',
            description: 'Flip a coin'
        },
        {
            command: '/select',
            description: 'Randomly select winners from a list'
        }
    ],
    other: [
        {
            command: '/help',
            description: 'Show all available bot commands'
        },
        {
            command: '/id',
            description: 'Get chat and user IDs'
        },
        {
            command: '/dev',
            description: 'Show developer information'
        },
        {
            command: '/request_feature',
            description: 'Request a new feature'
        }
    ]
};
