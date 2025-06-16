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
            command: "/price",
            description: 'Get cryptocurrency price information'
        },
        {
            command: '/calc',
            description: 'Calculate crypto conversions'
        },
        {
            command: '/chart',
            description: 'Get cryptocurrency price chart'
        }
    ],
    fun: [
        {
            command: '/joke',
            description: 'Get random joke setup-punchline'
        },
        {
            command: '/coin_flip',
            description: 'Flip a coin heads/tails'
        },
        {
            command: '/select',
            description: 'Random selection from given names'
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
