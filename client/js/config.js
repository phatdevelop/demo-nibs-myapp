angular.module('nibs.config', [])

    .constant('SERVER_URL', null)

    .constant('FB_APP_ID','1618878675020266')

    .constant('LINE_CHANNEL_ID', '1524762961')

    .constant('LINE_CHANNEL_SECRET', '59887b50400fcd8bd40359b9045ce39b')

    .constant('LINE_LOGIN_URL', 'https://access.line.me/dialog/oauth/weblogin')

    .constant('LINE_GET_TOKEN_URL', 'https://api.line.me/v2/oauth/accessToken')

    .constant('LINE_GET_USER_URL', 'https://api.line.me/v2/profile')

    .constant('CALLBACK_URL', 'https://testlineup.herokuapp.com/oauthcallback.html')    

    .constant('STATUS_LABELS', [
        'Forastero',
        'Trinitario',
        'Criollo'
    ])

    .constant('STATUS_DESCRIPTIONS', [
        'Forastero (For-ah-stare-oh)  is a common base to all but the finest of chocolates.  Our newest Nibs members move as fast as Forastero pods grow.',
        'Trinitario (Trin-it-air-ee-yo)  is a hybrid combining the superior taste of the criollo bean with the resilience of the forastero bean. It’s not quite as rare as Criollo, but it’s close!',
        'Criollo (Kree-oh-yo) is the most valued and rare type of cacao. Our highest level of Nibs members share the taste and sophistication of  select Crillolo pods.'
    ]);
