import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Keycloak from 'keycloak-js';

const app = createApp(App)

app.use(router)

app.mount('#app')

let initOptions = {
    url: 'http://108.136.252.160:8080/auth/', realm: 'DPR', clientId: 'aaa', onLoad: 'login-required'
}

let keycloak = Keycloak(initOptions);

keycloak.init({
    onLoad: initOptions.onLoad,
    promiseType: 'native',
    checkLoginIframe: false,
    pkceMethod: 'S256'
}).then((auth) => {
    if (!auth) {
        window.location.reload();
    } else {
        console.log("Authenticated");
        console.log(keycloak)

        app.mount({
            el: '#app',
            render: h => h(App, { props: { keycloak: keycloak } })
        })
    }


    //Token Refresh
    setInterval(() => {
        keycloak.updateToken(70).then((refreshed) => {
            if (refreshed) {
                console.log('Token refreshed' + refreshed);
            } else {
                console.log('Token not refreshed, valid for '
                    + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
            }
        }).catch(() => {
            console.log('Failed to refresh token');
        });
    }, 6000)

}).catch(() => {
    console.log("Authenticated Failed");
});