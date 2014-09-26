angular.module('encore.ui.configs', [])
.value('devicePaths', [
    { value: '/dev/xvdb', label: '/dev/xvdb' },
    { value: '/dev/xvdd', label: '/dev/xvdd' },
    { value: '/dev/xvde', label: '/dev/xvde' },
    { value: '/dev/xvdf', label: '/dev/xvdf' },
    { value: '/dev/xvdg', label: '/dev/xvdg' },
    { value: '/dev/xvdh', label: '/dev/xvdh' },
    { value: '/dev/xvdj', label: '/dev/xvdj' },
    { value: '/dev/xvdk', label: '/dev/xvdk' },
    { value: '/dev/xvdl', label: '/dev/xvdl' },
    { value: '/dev/xvdm', label: '/dev/xvdm' },
    { value: '/dev/xvdn', label: '/dev/xvdn' },
    { value: '/dev/xvdo', label: '/dev/xvdo' },
    { value: '/dev/xvdp', label: '/dev/xvdp' }
])
.constant('feedbackApi', '/api/feedback')
.constant('routesCdnPath', {
    production: 'https://d5b31243886503cdda55-92f888f8ef3e8464bcb65f52330fcbfb.ssl.cf1.rackcdn.com/encoreNav.json',
    staging: 'https://5593626d69acc4cdb66a-521ce2b7cdb9308893eabb7915d88c0c.ssl.cf1.rackcdn.com/encoreNav.json',
    preprod: 'https://b24ad15095637d2f91ee-ae6903de16cd565a74a9a50d287ad33f.ssl.cf1.rackcdn.com/encoreNav.json'
});
